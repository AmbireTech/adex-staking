import { Contract } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXLoyaltyPoolTokenABI from "../abi/ADXLoyaltyPoolToken"
import {
	ADDR_ADX,
	ADDR_ADX_LOYALTY_TOKEN,
	ZERO,
	MAX_UINT
} from "../helpers/constants"
import { STAKING_POOL_EVENT_TYPES } from "../actions/v5actions"
import { timeout } from "./common"
import { getSigner, getDefaultProvider, isAmbireWallet } from "../ethereum"

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
	totalSharesOutTransfersAdxValue: ZERO,
	totalSharesInTransfersAdxValue: ZERO,
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

	const adxTransfersInByTxHash = adexTokenTransfersInLogs.reduce(
		(txns, log) => {
			txns[log.transactionHash] = log
			return txns
		},
		{}
	)

	const sharesTokensTransfersIn = lpTokenTransfersInLogs.map(log => {
		const parsedLog = LoyaltyToken.interface.parseLog(log)

		const {
			from, // [0]
			amount // [2]
		} = parsedLog.args

		return {
			transactionHash: log.transactionHash,
			blockNumber: log.blockNumber,
			shares: amount,
			type:
				from === ZERO_ADDR
					? STAKING_POOL_EVENT_TYPES.enter
					: STAKING_POOL_EVENT_TYPES.shareTokensTransferIn,
			from,
			pool: "adex-loyalty-pool"
		}
	})

	// TODO: detect innerBurn transactions to ZERO_ADDR (burned by the user itself)
	const sharesTokensTransfersOut = lpTokenTransfersOutLogs.map(log => {
		const parsedLog = LoyaltyToken.interface.parseLog(log)

		const {
			to, // [1]
			amount // [2]
		} = parsedLog.args

		return {
			transactionHash: log.transactionHash,
			blockNumber: log.blockNumber,
			shares: amount,
			type:
				to === ZERO_ADDR
					? STAKING_POOL_EVENT_TYPES.withdraw
					: STAKING_POOL_EVENT_TYPES.shareTokensTransferOut,
			to,
			pool: "adex-loyalty-pool"
		}
	})

	// const hasExternalLoyaltyTokenTransfers = sharesTokensTransfersIn.some(
	// 	log => log.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferIn
	// ) || sharesTokensTransfersOut.some(
	// 	log => log.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferOut
	// )

	const userDeposits = sharesTokensTransfersIn.reduce(
		(deposits, log) => {
			const axdTransferLog = adxTransfersInByTxHash[log.transactionHash]

			if (axdTransferLog) {
				const adxTransferLog = Token.interface.parseLog(axdTransferLog)
				const adxLPT = log.shares
				const adx = adxTransferLog.args[2]

				deposits.adx = deposits.adx.add(adx)
				deposits.adxLPT = deposits.adxLPT.add(adxLPT)
				deposits.logs.push({
					transactionHash: log.transactionHash,
					type: STAKING_POOL_EVENT_TYPES.enter,
					shares: adxLPT,
					adxAmount: adx,
					blockNumber: log.blockNumber,
					pool: "adex-loyalty-pool"
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

	const userWithdraws = sharesTokensTransfersOut.reduce(
		(withdraws, log) => {
			const axdTransferLog = adxTransfersOutByTxHash[log.transactionHash]

			if (axdTransferLog && log.type === STAKING_POOL_EVENT_TYPES.withdraw) {
				const adxTransferLog = Token.interface.parseLog(axdTransferLog)
				const adxLPT = log.shares
				const adx = adxTransferLog.args[2]

				withdraws.adx = withdraws.adx.add(adx)
				withdraws.adxLPT = withdraws.adxLPT.add(adxLPT)

				withdraws.logs.push({
					transactionHash: log.transactionHash,
					type: STAKING_POOL_EVENT_TYPES.withdraw,
					shares: adxLPT,
					adxAmount: adx,
					blockNumber: log.blockNumber,
					pool: "adex-loyalty-pool"
				})
			}

			return withdraws
		},
		{ adx: ZERO, adxLPT: ZERO, logs: [] }
	)

	const sharesTokensTransfersInFromExternal = [
		...sharesTokensTransfersIn
	].filter(x => x.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferIn)

	const shareTokensTransferOutToExternal = [...sharesTokensTransfersOut].filter(
		x => x.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferOut
	)

	if (
		shareTokensTransferOutToExternal.length ||
		sharesTokensTransfersInFromExternal.length
	) {
		const fromBlock = Math.min(
			sharesTokensTransfersOut[0]
				? sharesTokensTransfersOut[0].blockNumber
				: Number.MAX_SAFE_INTEGER,
			sharesTokensTransfersInFromExternal[0]
				? sharesTokensTransfersInFromExternal[0].blockNumber
				: Number.MAX_SAFE_INTEGER
		)

		const [
			allAdxInLogs,
			allSharesOutLogs,
			allAdxOutLogs,
			allSharesInLogs
		] = await Promise.all([
			provider.getLogs({
				fromBlock,
				...Token.filters.Transfer(null, LoyaltyToken.address, null)
			}),
			provider.getLogs({
				fromBlock,
				...LoyaltyToken.filters.Transfer(ZERO_ADDR, null, null)
			}),
			provider.getLogs({
				fromBlock,
				...Token.filters.Transfer(LoyaltyToken.address, null, null)
			}),
			provider.getLogs({
				fromBlock,
				...LoyaltyToken.filters.Transfer(null, ZERO_ADDR, null)
			})
		])

		const enterAdxTokensByTxHash = allAdxInLogs.reduce((byHash, log) => {
			byHash[log.transactionHash] = log
			return byHash
		}, {})

		const outAdxTokensByTxHash = allAdxOutLogs.reduce((byHash, log) => {
			byHash[log.transactionHash] = log
			return byHash
		}, {})

		const allEnters = allSharesOutLogs
			.map(sharesMintEvent => {
				const adexTokenTransfersLog =
					enterAdxTokensByTxHash[sharesMintEvent.transactionHash]

				if (adexTokenTransfersLog) {
					const { value: adxAmount } = Token.interface.parseLog(
						adexTokenTransfersLog
					).args

					const { amount: shares } = LoyaltyToken.interface.parseLog(
						sharesMintEvent
					).args

					return {
						blockNumber: sharesMintEvent.blockNumber,
						shareValue: shares.isZero()
							? ZERO
							: adxAmount.mul(ADX_LP_TOKEN_DECIMALS_MUL).div(shares)
					}
				} else {
					return null
				}
			})
			.filter(x => !!x)

		const allWithdraws = allSharesInLogs
			.map(sharesMintEvent => {
				const adexTokenTransfersLog =
					outAdxTokensByTxHash[sharesMintEvent.transactionHash]

				if (adexTokenTransfersLog) {
					const { value: adxAmount } = Token.interface.parseLog(
						adexTokenTransfersLog
					).args
					const { amount: shares } = LoyaltyToken.interface.parseLog(
						sharesMintEvent
					).args

					return {
						blockNumber: sharesMintEvent.blockNumber,
						shareValue: shares.isZero()
							? ZERO
							: adxAmount.mul(ADX_LP_TOKEN_DECIMALS_MUL).div(shares)
					}
				} else {
					return null
				}
			})
			.filter(x => !!x)

		const allLogs = allEnters
			.concat(allWithdraws)
			.sort((a, b) => a.blockNumber - b.blockNumber)

		const withAdxAmount = events =>
			events.forEach((transferLog, i) => {
				const nextLog =
					allLogs.find(log => log.blockNumber >= transferLog.blockNumber) || {}

				const bestShareValue = nextLog.shareValue || currentShareValue

				// approximate share value
				events[i].shareValue = bestShareValue
				events[i].adxAmount = transferLog.shares
					.mul(bestShareValue)
					.div(ADX_LP_TOKEN_DECIMALS_MUL)
			})

		withAdxAmount(shareTokensTransferOutToExternal)
		withAdxAmount(sharesTokensTransfersInFromExternal)
	}

	// TODO: LP token external transfers - TEST
	const allStakingEvents = userDeposits.logs
		.concat(userWithdraws.logs)
		.concat(shareTokensTransferOutToExternal)
		.concat(sharesTokensTransfersInFromExternal)
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

	const totalSharesOutTransfersAdxValue = shareTokensTransferOutToExternal.reduce(
		(a, b) => a.add(b.adxAmount),
		ZERO
	)

	const totalSharesInTransfersAdxValue = sharesTokensTransfersInFromExternal.reduce(
		(a, b) => a.add(b.adxAmount),
		ZERO
	)

	const totalDeposits = userDeposits.adx.add(totalSharesInTransfersAdxValue)
	const totalWithdraws = userWithdraws.adx.add(totalSharesOutTransfersAdxValue)

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
		totalDeposits,
		totalWithdraws,
		totalSharesOutTransfersAdxValue,
		totalSharesInTransfersAdxValue,
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
		const approve = async () =>
			tokenWithSigner.approve(LoyaltyToken.address, MAX_UINT)

		if (isAmbireWallet(signer)) {
			approve()
			await timeout(420)
		} else {
			await approve()
		}
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
