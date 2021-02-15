import { Contract, BigNumber } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXTokenABI from "../abi/ADXToken"
import ADXSupplyControllerABI from "../abi/ADXSupplyController"
import { ADDR_ADX, ZERO } from "../helpers/constants"
import { getDefaultProvider } from "../ethereum"
// import { getPrices, executeOnIdentity } from './common'

const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const ADDR_STAKING_POOL = "0x0000000000000000000000000000000000000000"
const ADDR_ADX_SUPPLY_CONTROLLER = "0x617e6f354d288fcb33e148b1bb6d2cc9be1f7695"
const stakingPoolABI = ERC20ABI //TODO
const supplyControllerABI = ADXSupplyControllerABI
const secondsInYear = 60 * 60 * 24 * 365
const PRECISION = 1_000_000

const provider = getDefaultProvider

const ADXToken = new Contract(ADDR_ADX, ADXTokenABI, provider)
const ADXSupplyController = new Contract(
	ADDR_ADX_SUPPLY_CONTROLLER,
	supplyControllerABI,
	provider
)
const StakingPool = new Contract(ADDR_STAKING_POOL, stakingPoolABI, provider)

export const STAKING_POOL_EVENT_TYPES = {
	enter: "enter",
	leave: "leave",
	burn: "burn",
	withdraw: "withdraw",
	rageLeave: "rageLeave",
	shareTokensTransferIn: "shareTokensTransferIn",
	shareTokensTransferOut: "shareTokensTransferOut"
}

export const STAKING_POOL_EMPTY_STATS = {
	balanceShares: ZERO,
	currentBalanceADX: ZERO,
	withdrawnReward: ZERO,
	poolTotalStaked: ZERO,
	rewardWithOutstanding: ZERO,
	currentReward: ZERO,
	totalSharesInTransfers: ZERO,
	currentAPY: 0,
	stakings: [],
	userLeaves: [],
	leavesPendingToUnlockTotalMax: ZERO,
	leavesReadyToWithdrawTotalMax: ZERO,
	loaded: false,
	userDataLoaded: false
}

export async function onMigrationToV5(
	chosenWalletType,
	{ amount, poolId, nonce }
) {
	// TODO: waiting for migration contract
	console.log(chosenWalletType, amount, poolId, nonce)
}

export async function onStakingPoolV5Deposit(
	chosenWalletType,
	{ amount, poolId }
) {
	console.log("onStakingPoolV5Deposit")
	// TODO:
}

export async function onStakingPoolV5Withdraw(
	chosenWalletType,
	{ amount, poolId }
) {
	console.log("onStakingPoolV5Withdraw", amount)
	// TODO:
}

export async function onStakingPoolV5UnbondCommitment(
	chosenWalletType,
	{ amount, poolId }
) {
	console.log("onStakingPoolV5UnbondCommitment", amount)
	// TODO:
}

export async function getTomStakingV5PoolData() {
	const [poolTotalStaked, incentivePerSecond] = await Promise.all([
		ADXToken.balanceOf(ADDR_STAKING_POOL),
		ADXSupplyController.incentivePerSecond(ADDR_STAKING_POOL)
	])

	return {
		poolTotalStaked,
		incentivePerSecond,
		currentAPY: incentivePerSecond.isZero()
			? 0
			: (incentivePerSecond
					.mul(PRECISION)
					.mul(secondsInYear)
					.div(incentivePerSecond)
					.toNumber() /
					PRECISION) *
			  100
	}
}

// to test the ui component
export async function loadUserTomStakingV5PoolStats({ identityAddr } = {}) {
	const poolData = await getTomStakingV5PoolData()
	if (!identityAddr) {
		return {
			...STAKING_POOL_EMPTY_STATS,
			...poolData,
			loaded: true
		}
	}

	const decimalsString = "000000000000000000"

	const stakings = [
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.enter,
			shares: BigNumber.from(4000 + decimalsString),
			adxAmount: BigNumber.from(3000 + decimalsString),
			blockNumber: 11295886,
			transactionHash: 1
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.leave,
			withdrawTxHash: 4,
			shares: BigNumber.from(400 + decimalsString),
			maxTokens: BigNumber.from(420 + decimalsString),
			unlocksAt: 1608353186,
			blockNumber: 11482093,
			transactionHash: 2,
			withdrawTx: {
				label: "Tom Staking Pool V5",
				type: STAKING_POOL_EVENT_TYPES.withdraw,
				shares: BigNumber.from(400 + decimalsString),
				maxTokens: BigNumber.from(420 + decimalsString),
				receivedTokens: BigNumber.from(420 + decimalsString),
				blockNumber: 11661741,
				transactionHash: 4
			}
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.leave,
			shares: BigNumber.from(480 + decimalsString),
			maxTokens: BigNumber.from(5000 + decimalsString),
			unlocksAt: 1610340386,
			canWithdraw: true,
			blockNumber: 11482999,
			transactionHash: 3
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.leave,
			shares: BigNumber.from(170 + decimalsString),
			maxTokens: BigNumber.from(200 + decimalsString),
			unlocksAt: 1611981986,
			blockNumber: 11481850,
			transactionHash: 3
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.withdraw,
			shares: BigNumber.from(400 + decimalsString),
			maxTokens: BigNumber.from(420 + decimalsString),
			receivedTokens: BigNumber.from(420 + decimalsString),
			blockNumber: 11661741,
			transactionHash: 4
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.rageLeave,
			shares: BigNumber.from(200 + decimalsString),
			adxAmount: BigNumber.from(220 + decimalsString),
			receivedTokens: BigNumber.from(170 + decimalsString),
			blockNumber: 11789046,
			transactionHash: 5
		}
	]

	const withTimestamp = await Promise.all(
		stakings.map(async stakngEvent => {
			const { timestamp } = await provider.getBlock(stakngEvent.blockNumber)
			return {
				...stakngEvent,
				timestamp: timestamp * 1000
			}
		})
	)

	const userLeaves = [...stakings].filter(
		x => x.type === STAKING_POOL_EVENT_TYPES.leave
	)

	const balanceShares = BigNumber.from(10 + decimalsString)
	const currentBalanceADX = BigNumber.from(11 + decimalsString)
	const withdrawnReward = BigNumber.from(1 + decimalsString)
	const rewardWithOutstanding = BigNumber.from(3 + decimalsString)
	const currentReward = BigNumber.from(2 + decimalsString)
	const leavesPendingToUnlockTotalMax = BigNumber.from(500 + decimalsString)
	const leavesReadyToWithdrawTotalMax = BigNumber.from(200 + decimalsString)

	return {
		...poolData,
		balanceShares,
		currentBalanceADX,
		withdrawnReward,
		rewardWithOutstanding,
		currentReward,
		// totalSharesInTransfers,
		stakings: withTimestamp,
		userLeaves,
		leavesPendingToUnlockTotalMax,
		leavesReadyToWithdrawTotalMax,
		loaded: true,
		userDataLoaded: true
	}
}

export async function _loadUserTomStakingV5PoolStats({ identityAddr } = {}) {
	const poolData = await getTomStakingV5PoolData()
	if (!identityAddr) {
		return {
			...STAKING_POOL_EMPTY_STATS,
			...poolData,
			loaded: true
		}
	}

	const [
		balanceShares,
		currentShareValue,
		enterADXTransferLogs,
		leaveLogs,
		withdrawLogs,
		rageLeaveLogs,
		sharesTokensTransfersInLogs,
		sharesTokensTransfersOutLogs
	] = await Promise.all([
		StakingPool.balanceOf(identityAddr),
		StakingPool.shareValue(),
		provider.getLogs({
			fromBlock: 0,
			...ADXToken.filters.Transfer(identityAddr, ADDR_STAKING_POOL, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogLeave(identityAddr, null, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(null, identityAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(identityAddr, null, null)
		})
	])

	const currentBalanceADX = balanceShares.mul(currentShareValue)

	const sharesTokensTransfersIn = sharesTokensTransfersInLogs.map(log => {
		const parsedLog = StakingPool.interface.parseLog(log)

		const {
			from, // [0]
			amount // [2]
		} = parsedLog

		return {
			transactionHash: log.transactionHash,
			blockNumber: log.blockNumber,
			shares: amount,
			type:
				from === ZERO_ADDR
					? STAKING_POOL_EVENT_TYPES.enter
					: STAKING_POOL_EVENT_TYPES.shareTokensTransferIn,
			from
		}
	})

	// Only out txns as we have logs for RageLEave and Withdraw and they only burns shares
	// TODO: detect innerBurn transactions to ZERO_ADDR (burned by the user itself)
	const sharesTokensTransfersOut = sharesTokensTransfersOutLogs
		.map(log => {
			const parsedLog = StakingPool.interface.parseLog(log)

			const {
				to, // [1]
				amount // [2]
			} = parsedLog

			return {
				transactionHash: log.transactionHash,
				blockNumber: log.blockNumber,
				shares: amount,
				type: STAKING_POOL_EVENT_TYPES.shareTokensTransferOut,
				to
			}
		})
		.filter(x => x.to !== ZERO_ADDR)

	const {
		shareTokensEnterMintByHash,
		shareTokensTransfersInByTxHas
	} = sharesTokensTransfersIn.reduce(
		(txns, event) => {
			if (event.type === STAKING_POOL_EVENT_TYPES.enter) {
				txns.shareTokensEnterMintByHash[event.transactionHash] = event
			}

			if (event.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferIn) {
				txns.shareTokensTransfersInByTxHas[event.transactionHash] = event
			}

			return txns
		},
		{ shareTokensEnterMintByHash: {}, shareTokensTransfersInByTxHas: {} }
	)

	const userEnters = enterADXTransferLogs
		.msp(log => {
			const sharesMintEvent = shareTokensEnterMintByHash[log.transactionHash]

			if (sharesMintEvent) {
				const parsedAdxLog = ADXToken.interface.parseLog(log)

				return {
					transactionHash: log.transactionHash,
					type: STAKING_POOL_EVENT_TYPES.enter,
					shares: sharesMintEvent.shares,
					adxAmount: parsedAdxLog.args.amount, // [2]
					blockNumber: log.blockNumber
				}
			} else {
				return null
			}
		})
		.filter(x => !!x)

	const userWithdraws = withdrawLogs.map(log => {
		const parsedWithdrawLog = StakingPool.interface.parseLog(log)
		const {
			shares,
			unlocksAt,
			maxTokens,
			receivedTokens
		} = parsedWithdrawLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.withdraw,
			shares, //[1]
			unlocksAt, //[2]
			maxTokens, //[3]
			receivedTokens, //[4]
			blockNumber: log.blockNumber
		}
	})

	const userRageLeaves = rageLeaveLogs.map(log => {
		const parsedRageLeaveLog = StakingPool.interface.parseLog(log)

		const { shares, adxAmount, receivedTokens } = parsedRageLeaveLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.rageLeave,
			shares, //[1]
			adxAmount, //[2]
			receivedTokens, //[3]
			blockNumber: log.blockNumber
		}
	})

	const now = Date.now() / 1000

	const userLeaves = leaveLogs.map(log => {
		const parsedLog = StakingPool.interface.parseLog(log)
		const { shares, unlocksAt, maxTokens } = parsedLog.args

		const withdrawTx = userWithdraws.find(
			event =>
				event.unlocksAt === unlocksAt &&
				event.shares === shares &&
				event.maxTokens === maxTokens
		)

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.leave,
			shares, // [1]
			unlocksAt, //[2]
			maxTokens, // [3]
			canWithdraw: unlocksAt < now && !withdrawTx,
			blockNumber: log.blockNumber,
			withdrawTx
		}
	})

	const leavesPendingToUnlock = [...userLeaves].filter(
		event => event.unlocksAt > now
	)
	const leavesReadyToWithdraw = [...userLeaves].filter(
		event => event.unlocksAt < now && !event.withdrawTx
	)

	const leavesPendingToUnlockTotalMax = leavesPendingToUnlock.reduce(
		(a, b) => a.maxTokens.add(b.maxTokens),
		ZERO
	)

	const leavesReadyToWithdrawTotalMax = leavesReadyToWithdraw.reduce(
		(a, b) => a.maxTokens.add(b.maxTokens),
		ZERO
	)

	const stakings = userEnters
		.concat(userLeaves)
		.concat(userWithdraws)
		.concat(userRageLeaves)
		.concat(sharesTokensTransfersIn)
		.concat(sharesTokensTransfersOut)

	const withTimestamp = await Promise.all(
		stakings.map(async stakingEvent => {
			const { timestamp } = await provider.getBlock(stakingEvent.blockNumber)
			return {
				...stakingEvent,
				timestamp: timestamp * 1000
			}
		})
	)

	const { buySharesByPrice, buyTotalShares } = userEnters.reduce(
		(data, log) => {
			data.buySharesByPrice = data.buySharesByPrice.add(
				log.shares.mul(log.adxAmount)
			)
			data.buyTotalShares = data.buyTotalShares.add(log.shares)

			return data
		},
		{ buySharesByPrice: ZERO, buyTotalShares: ZERO }
	)

	const { sellSharesByPrice, sellTotalShares } = userWithdraws
		.concat(userRageLeaves)
		.reduce(
			(data, log) => {
				data.sellSharesByPrice = data.sellSharesByPrice.add(
					log.shares.mul(log.adxAmount)
				)
				data.sellTotalShares = data.sellTotalShares.add(log.shares)

				return data
			},
			{ sellSharesByPrice: ZERO, sellTotalShares: ZERO }
		)

	const totalSharesOutTransfers = sharesTokensTransfersOut.reduce(
		(a, b) => a.shares.add(b.shares),
		ZERO
	)
	const totalSharesInTransfers = Object.values(
		shareTokensTransfersInByTxHas
	).reduce((a, b) => a.shares.add(b).shares, ZERO)

	const avgShareBuyPrice = buySharesByPrice.div(buyTotalShares)
	const avgShareSellPrice = sellSharesByPrice.div(sellTotalShares)
	const isPositiveTardeDelta = avgShareSellPrice.gt(avgShareBuyPrice)
	const avgTradeDelta = isPositiveTardeDelta
		? avgShareSellPrice.sub(avgShareBuyPrice)
		: avgShareBuyPrice.sub(avgShareSellPrice)
	const withdrawnReward = buyTotalShares
		.sub(totalSharesOutTransfers)
		.mul(avgTradeDelta)

	const avgSellPriceWithOutstanding = sellSharesByPrice.add(
		balanceShares.mul(currentBalanceADX)
	)
	const isPositiveTardeDeltaWithOutstanding = avgSellPriceWithOutstanding.gt(
		avgShareBuyPrice
	)
	const avgTradeDeltaWithOutstanding = isPositiveTardeDeltaWithOutstanding
		? avgSellPriceWithOutstanding.sub(avgShareBuyPrice)
		: avgShareBuyPrice.sub(avgSellPriceWithOutstanding)
	const rewardWithOutstanding = buyTotalShares
		.add(balanceShares)
		.sub(totalSharesOutTransfers)
		.mul(avgTradeDeltaWithOutstanding)

	const currentReward = rewardWithOutstanding.sub(withdrawnReward)

	return {
		...poolData,
		balanceShares,
		currentBalanceADX,
		withdrawnReward,
		rewardWithOutstanding,
		currentReward,
		totalSharesInTransfers,
		stakings: withTimestamp,
		userLeaves,
		leavesPendingToUnlockTotalMax,
		leavesReadyToWithdrawTotalMax,
		loaded: true,
		userDataLoaded: true
	}
}
