import { Contract } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXLoyaltyPoolTokenABI from "../abi/ADXLoyaltyPoolToken"
import {
	ADDR_ADX,
	ADDR_ADX_LOYALTY_TOKEN,
	ZERO,
	MAX_UINT
} from "../helpers/constants"
import { getSigner, getDefaultProvider } from "../ethereum"

const defaultProvider = getDefaultProvider

const provider = defaultProvider
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const LoyaltyToken = new Contract(
	ADDR_ADX_LOYALTY_TOKEN,
	ADXLoyaltyPoolTokenABI,
	provider
)
const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const ADX_LP_TOKEN_DECIMALS_MUL = "1000000000000000000"
const PRECISION = 1_000_000_000_000

export const LOYALTY_POOP_EMPTY_STATS = {
	balanceLpToken: ZERO,
	balanceLpADX: ZERO,
	rewardADX: ZERO,
	poolTotalStaked: ZERO,
	currentAPY: 0,
	poolDepositsLimit: ZERO,
	loaded: false,
	userDataLoaded: false,
	unbondDays: 0,
	stakingEvents: [],
	totalRewards: ZERO,
	totalDeposits: ZERO,
	totalWithdraws: ZERO,
	userShare: 0
}

export async function loadLoyaltyPoolData() {
	const [
		poolTotalStaked,
		currentAPY,
		poolDepositsLimit,
		sharesTotalSupply
	] = await Promise.all([
		Token.balanceOf(ADDR_ADX_LOYALTY_TOKEN),
		LoyaltyToken.incentivePerTokenPerAnnum(),
		LoyaltyToken.maxTotalADX(),
		LoyaltyToken.totalSupply()
	])

	return {
		...LOYALTY_POOP_EMPTY_STATS,
		poolTotalStaked,
		poolDepositsLimit,
		currentAPY:
			currentAPY
				.mul(1000)
				.div(ADX_LP_TOKEN_DECIMALS_MUL)
				.toNumber() / 1000,
		sharesTotalSupply
	}
}

export async function loadUserLoyaltyPoolsStats(walletAddr) {
	const poolData = await loadLoyaltyPoolData()
	if (!walletAddr) {
		return {
			...poolData,
			loaded: true
		}
	}

	const [
		balanceLpToken,
		currentShareValue,
		lpTokenTransfersInLogs,
		lpTokenTransfersOutLogs,
		adexTokenTransfersInLogs,
		adexTokenTransfersOutLogs
	] = await Promise.all([
		LoyaltyToken.balanceOf(walletAddr),
		LoyaltyToken.shareValue(),
		provider.getLogs({
			fromBlock: 0,
			...LoyaltyToken.filters.Transfer(null, walletAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...LoyaltyToken.filters.Transfer(walletAddr, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(walletAddr, ADDR_ADX_LOYALTY_TOKEN, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(ADDR_ADX_LOYALTY_TOKEN, walletAddr, null)
		})
	])

	const balanceLpADX = balanceLpToken
		.mul(currentShareValue)
		.div(ADX_LP_TOKEN_DECIMALS_MUL)

	const currentBalance = {
		...poolData,
		balanceLpToken,
		balanceLpADX,
		loaded: true,
		userDataLoaded: true
	}

	const hasExternalLoyaltyTokenTransfers = lpTokenTransfersInLogs.some(
		log => LoyaltyToken.interface.parseLog(log).args[0] !== ZERO_ADDR
	)

	// reward === null => unknown reward - can not be calculated
	if (hasExternalLoyaltyTokenTransfers) {
		currentBalance.allTimeRewardADX = null
		return currentBalance
	}

	const adxTransfersInByTxHash = adexTokenTransfersInLogs.reduce(
		(txns, log) => {
			txns[log.transactionHash] = log
			return txns
		},
		{}
	)

	const userDeposits = lpTokenTransfersInLogs.reduce(
		(deposits, log) => {
			const axdTransferLog = adxTransfersInByTxHash[log.transactionHash]

			if (axdTransferLog) {
				const lpTokenLog = LoyaltyToken.interface.parseLog(log)
				const adxTransferLog = Token.interface.parseLog(axdTransferLog)
				const adxLPT = lpTokenLog.args[2]
				const adx = adxTransferLog.args[2]

				deposits.adx = deposits.adx.add(adx)
				deposits.adxLPT = deposits.adxLPT.add(adxLPT)
				deposits.logs.push({
					transactionHash: log.transactionHash,
					type: "deposit",
					shares: adxLPT,
					adxAmount: adx,
					blockNumber: log.blockNumber
				})
			}

			return deposits
		},
		{ adx: ZERO, adxLPT: ZERO, logs: [] }
	)

	const adxTransfersOutByTxHash = adexTokenTransfersOutLogs.reduce(
		(txns, log) => {
			txns[log.transactionHash] = log
			return txns
		},
		{}
	)

	const userWithdraws = lpTokenTransfersOutLogs.reduce(
		(withdraws, log) => {
			const axdTransferLog = adxTransfersOutByTxHash[log.transactionHash]

			if (axdTransferLog) {
				const lpTokenLog = LoyaltyToken.interface.parseLog(log)
				const adxTransferLog = Token.interface.parseLog(axdTransferLog)
				const adxLPT = lpTokenLog.args[2]
				const adx = adxTransferLog.args[2]

				withdraws.adx = withdraws.adx.add(adx)
				withdraws.adxLPT = withdraws.adxLPT.add(adxLPT)

				withdraws.logs.push({
					transactionHash: log.transactionHash,
					type: "withdraw",
					shares: adxLPT,
					adxAmount: adx,
					blockNumber: log.blockNumber
				})
			}

			return withdraws
		},
		{ adx: ZERO, adxLPT: ZERO, logs: [] }
	)

	// TODO: LP token external transfers
	const allStakingEvents = userDeposits.logs
		.concat(userWithdraws.logs)
		.sort((a, b) => a.blockNumber - b.blockNumber)

	const withTimestamp = await Promise.all(
		allStakingEvents.map(async stakingEvent => {
			const { timestamp } = await provider.getBlock(stakingEvent.blockNumber)
			return {
				...stakingEvent,
				timestamp: timestamp * 1000
			}
		})
	)
	const totalRewards = balanceLpADX.add(userWithdraws.adx).sub(userDeposits.adx)

	const userShare = poolData.sharesTotalSupply.isZero()
		? ZERO
		: balanceLpADX
				.mul(PRECISION)
				.div(poolData.sharesTotalSupply)
				.toNumber() / PRECISION

	const stats = {
		...currentBalance,
		stakingEvents: withTimestamp,
		totalRewards,
		totalDeposits: userDeposits.adx,
		totalWithdraws: userWithdraws.adx,
		userShare
	}

	return stats
}

export async function onLoyaltyPoolDeposit(
	stats,
	chosenWalletType,
	adxDepositAmount
) {
	if (!stats) throw new Error("errors.statsNotProvided")
	if (!adxDepositAmount) throw new Error("errors.noDepositAmount")
	if (adxDepositAmount.isZero()) throw new Error("errors.zeroDeposit")
	if (adxDepositAmount.gt(stats.userBalance))
		throw new Error("errors.amountTooLarge")

	const signer = await getSigner(chosenWalletType)
	const walletAddr = await signer.getAddress()

	const [allowanceADXLOYALTY] = await Promise.all([
		Token.allowance(walletAddr, LoyaltyToken.address)
	])

	const setAllowance = allowanceADXLOYALTY.lt(adxDepositAmount)

	if (setAllowance) {
		const tokenWithSigner = new Contract(ADDR_ADX, ERC20ABI, signer)
		await tokenWithSigner.approve(LoyaltyToken.address, MAX_UINT)
	}

	const loyaltyTokenWithSigner = new Contract(
		ADDR_ADX_LOYALTY_TOKEN,
		ADXLoyaltyPoolTokenABI,
		signer
	)

	await loyaltyTokenWithSigner.enter(
		adxDepositAmount,
		setAllowance ? { gasLimit: 150000 } : {}
	)
}

export async function onLoyaltyPoolWithdraw(
	stats,
	chosenWalletType,
	withdrawAmountADX
) {
	if (!stats) throw new Error("errors.statsNotProvided")

	const { balanceLpADX, balanceLpToken } = stats.loyaltyPoolStats

	if (!withdrawAmountADX) throw new Error("errors.noWithdrawAmount")
	if (balanceLpADX.isZero()) throw new Error("errors.zeroDeposit")
	if (withdrawAmountADX.gt(balanceLpADX))
		throw new Error("errors.amountTooLarge")

	const signer = await getSigner(chosenWalletType)

	const loyaltyTokenWithSigner = new Contract(
		ADDR_ADX_LOYALTY_TOKEN,
		ADXLoyaltyPoolTokenABI,
		signer
	)

	const lpTokensToWithdraw = withdrawAmountADX
		.mul(balanceLpToken)
		.div(balanceLpADX)
	await loyaltyTokenWithSigner.leave(lpTokensToWithdraw)
}
