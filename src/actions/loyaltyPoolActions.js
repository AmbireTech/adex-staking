import { Contract } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXLoyaltyPoolTokenABI from "../abi/ADXLoyaltyPoolToken"
import {
	ADDR_ADX,
	ADDR_ADX_LOYALTY_TOKEN,
	ZERO,
	MAX_UINT,
	DEPOSIT_POOLS
} from "../helpers/constants"
import { getSigner, getDefaultProvider } from "../ethereum"

const defaultProvider = getDefaultProvider

export const getDepositPool = poolId => DEPOSIT_POOLS.find(x => x.id === poolId)

const provider = defaultProvider
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const LoyaltyToken = new Contract(
	ADDR_ADX_LOYALTY_TOKEN,
	ADXLoyaltyPoolTokenABI,
	provider
)
const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const ADX_LP_TOKEN_DECIMALS_MUL = "1000000000000000000"

export const LOYALTY_POOP_EMPTY_STATS = {
	balanceLpToken: ZERO,
	balanceLpADX: ZERO,
	rewardADX: ZERO,
	poolTotalStaked: ZERO,
	currentAPY: 0,
	poolDepositsLimit: ZERO,
	loaded: false,
	userDataLoaded: false
}

export async function loadLoyaltyPoolData() {
	const [poolTotalStaked, currentAPY, poolDepositsLimit] = await Promise.all([
		Token.balanceOf(ADDR_ADX_LOYALTY_TOKEN),
		LoyaltyToken.incentivePerTokenPerAnnum(),
		LoyaltyToken.maxTotalADX()
	])

	return {
		poolTotalStaked,
		poolDepositsLimit,
		currentAPY:
			currentAPY
				.mul(1000)
				.div(ADX_LP_TOKEN_DECIMALS_MUL)
				.toNumber() / 1000
	}
}

export async function loadUserLoyaltyPoolsStats(walletAddr) {
	const poolData = await loadLoyaltyPoolData()
	if (!walletAddr) {
		return {
			...LOYALTY_POOP_EMPTY_STATS,
			...poolData,
			loaded: true
		}
	}

	const [
		balanceLpToken,
		currentShareValue,
		loyaltyTokenTransfersLogs,
		adexTokenTransfersLogs
	] = await Promise.all([
		LoyaltyToken.balanceOf(walletAddr),
		LoyaltyToken.shareValue(),
		provider.getLogs({
			fromBlock: 0,
			...LoyaltyToken.filters.Transfer(null, walletAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(walletAddr, ADDR_ADX_LOYALTY_TOKEN, null)
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

	const hasExternalLoyaltyTokenTransfers = loyaltyTokenTransfersLogs.some(
		log => LoyaltyToken.interface.parseLog(log).args[0] !== ZERO_ADDR
	)

	// reward === null => unknown reward - can not be calculated
	if (hasExternalLoyaltyTokenTransfers) {
		currentBalance.allTimeRewardADX = null
		return currentBalance
	}

	const adxTransfersByTxHash = adexTokenTransfersLogs.reduce((txns, log) => {
		txns[log.transactionHash] = log
		return txns
	}, {})

	const userDeposits = loyaltyTokenTransfersLogs.reduce(
		(deposits, log) => {
			const axdTransferLog = adxTransfersByTxHash[log.transactionHash]

			if (axdTransferLog) {
				const lpTokenLog = LoyaltyToken.interface.parseLog(log)
				const adxTransferLog = Token.interface.parseLog(axdTransferLog)

				deposits.adx = deposits.adx.add(lpTokenLog.args[2])
				deposits.adxLPT = deposits.adxLPT.add(adxTransferLog.args[2])
			}

			return deposits
		},
		{ adx: ZERO, adxLPT: ZERO }
	)

	// multiply by decimals to keep the precision
	const avgDepositShareValue = userDeposits.adx.isZero()
		? ZERO
		: userDeposits.adxLPT.mul(ADX_LP_TOKEN_DECIMALS_MUL).div(userDeposits.adx)

	const reward = balanceLpToken
		.mul(currentShareValue.sub(avgDepositShareValue))
		.div(ADX_LP_TOKEN_DECIMALS_MUL)

	// console.log('reward', reward.toString())
	// console.log('balanceLpToken', balanceLpToken.toString())
	// console.log('balanceLpADX', balanceLpADX.toString())

	currentBalance.allTimeRewardADX = reward

	return currentBalance
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
