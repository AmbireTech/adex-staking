import { Contract, BigNumber } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXTokenABI from "../abi/ADXToken"
import StakingABI from "adex-protocol-eth/abi/Staking"
import ADXSupplyControllerABI from "../abi/ADXSupplyController"
import StakingMigratorABI from "../abi/StakingMigrator.json"
import StakingPoolABI from "../abi/StakingPool.json"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import {
	ADDR_ADX,
	ADDR_STAKING,
	ADDR_CORE,
	ZERO,
	MAX_UINT,
	ZERO_ADDR,
	ADDR_STAKING_POOL,
	ADDR_STAKING_MIGRATOR,
	ADDR_ADX_SUPPLY_CONTROLLER
} from "../helpers/constants"
import { getDefaultProvider, getSigner } from "../ethereum"
import { executeOnIdentity, toChannelTuple } from "./common"

const supplyControllerABI = ADXSupplyControllerABI
const secondsInYear = 60 * 60 * 24 * 365
const PRECISION = 1_000_000_000_000

const provider = getDefaultProvider

const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const ADXToken = new Contract(ADDR_ADX, ADXTokenABI, provider)
const ADXSupplyController = new Contract(
	ADDR_ADX_SUPPLY_CONTROLLER,
	supplyControllerABI,
	provider
)
const StakingPool = new Contract(ADDR_STAKING_POOL, StakingPoolABI, provider)
const StakingMigrator = new Contract(
	ADDR_STAKING_MIGRATOR,
	StakingMigratorABI,
	provider
)
const Core = new Contract(ADDR_CORE, CoreABI, provider)

const POOL_SHARES_TOKEN_DECIMALS_MUL = "1000000000000000000"

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
	shareValue: ZERO,
	balanceShares: ZERO,
	currentBalanceADX: ZERO,
	withdrawnReward: ZERO,
	poolTotalStaked: ZERO,
	poolTotalBalanceADX: ZERO,
	sharesTotalSupply: ZERO,
	totalRewards: ZERO,
	currentReward: ZERO,
	withdrawsADXTotal: ZERO,
	depositsADXTotal: ZERO,
	totalSharesInTransfers: ZERO,
	currentAPY: 0,
	stakings: [],
	userLeaves: [],
	leavesPendingToUnlockTotalMax: ZERO,
	leavesReadyToWithdrawTotalMax: ZERO,
	leavesPendingToUnlockTotalADX: ZERO,
	leavesReadyToWithdrawTotalADX: ZERO,
	loaded: false,
	userDataLoaded: false,
	rageReceivedPromilles: 700,
	timeToUnbond: 1,
	userShare: 0
}

export async function onMigrationToV5(
	chosenWalletType,
	{ amount, poolId, nonce }
) {
	const bond = [amount, poolId, nonce || ZERO]
	await executeOnIdentity(chosenWalletType, [
		[
			Staking.address,
			Staking.interface.encodeFunctionData("requestUnbond", [bond])
		],
		[
			StakingMigrator.address,
			StakingMigrator.interface.encodeFunctionData("requestMigrate", [
				amount,
				nonce
			])
		]
	])
}

export async function onMigrationToV5Finalize(
	chosenWalletType,
	{ amount, poolId, nonce },
	claimPendingRewards,
	stats
) {
	console.log("stats", stats)
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")
	const walletAddr = await signer.getAddress()

	const {
		identityADXIncentiveChannels,
		identityAdxRewardsAmount
	} = stats.tomPoolStats

	const identityTxns = []

	if (claimPendingRewards) {
		identityTxns.concat(
			identityADXIncentiveChannels.map(channel => {
				const channelTuple = toChannelTuple(channel.channelArgs)
				return [
					Core.address,
					Core.interface.encodeFunctionData("channelWithdraw", [
						channelTuple,
						channel.stateRoot,
						channel.signatures,
						channel.proof,
						channel.amount
					])
				]
			})
		)

		// TODO: Transfer rewards to staking migrator
	}

	await executeOnIdentity(chosenWalletType, [
		...identityTxns,
		[
			StakingMigrator.address,
			StakingMigrator.interface.encodeFunctionData("finishMigration", [
				amount,
				nonce,
				walletAddr,
				identityAdxRewardsAmount
			])
		]
	])
}

export async function onStakingPoolV5Deposit(
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

	const [allowanceStakingPool] = await Promise.all([
		ADXToken.allowance(walletAddr, StakingPool.address)
	])

	const setAllowance = allowanceStakingPool.lt(adxDepositAmount)

	if (setAllowance) {
		const tokenWithSigner = new Contract(ADDR_ADX, ERC20ABI, signer)
		await tokenWithSigner.approve(StakingPool.address, MAX_UINT)
	}

	const stakingPoolWithSigner = new Contract(
		ADDR_STAKING_POOL,
		StakingPoolABI,
		signer
	)

	await stakingPoolWithSigner.enter(
		adxDepositAmount,
		{ gasLimit: 250000 }
		// setAllowance ? { gasLimit: 250000 } : {}
	)
}

export async function onStakingPoolV5Withdraw(
	stats,
	chosenWalletType,
	_,
	unbondCommitment
) {
	console.log("onStakingPoolV5Withdraw", unbondCommitment)

	if (!stats) throw new Error("errors.statsNotProvided")
	if (!unbondCommitment) throw new Error("errors.noUnbondCommitmentProvided")
	// TODO: validate unbondCommitment

	const signer = await getSigner(chosenWalletType)

	const stakingPoolWithSigner = new Contract(
		ADDR_STAKING_POOL,
		StakingPoolABI,
		signer
	)

	const { shares, unlockAt } = unbondCommitment

	await stakingPoolWithSigner.withdraw(shares, unlockAt, false)
}

export async function onStakingPoolV5RageLeave(
	stats,
	chosenWalletType,
	rageLeaveADXAmount
) {
	if (!stats) throw new Error("errors.statsNotProvided")
	if (!rageLeaveADXAmount) throw new Error("errors.noRageLeaveAAmount")

	const signer = await getSigner(chosenWalletType)

	const stakingPoolWithSigner = new Contract(
		ADDR_STAKING_POOL,
		StakingPoolABI,
		signer
	)

	const { balanceShares, currentBalanceADX } = stats.tomStakingV5PoolStats

	const sharesToWithdraw = rageLeaveADXAmount
		.mul(balanceShares)
		.div(currentBalanceADX)

	await stakingPoolWithSigner.rageLeave(sharesToWithdraw, false)
}

export async function onStakingPoolV5UnbondCommitment(
	stats,
	chosenWalletType,
	unbondCommitmentAmountADX
) {
	console.log("onStakingPoolV5UnbondCommitment", unbondCommitmentAmountADX)

	if (!stats) throw new Error("errors.statsNotProvided")

	const { balanceShares, currentBalanceADX } = stats.tomStakingV5PoolStats

	if (!unbondCommitmentAmountADX) throw new Error("errors.noWithdrawAmount")
	if (currentBalanceADX.isZero()) throw new Error("errors.zeroBalanceADX")
	if (unbondCommitmentAmountADX.gt(currentBalanceADX))
		throw new Error("errors.amountTooLarge")

	const signer = await getSigner(chosenWalletType)

	const stakingPoolWithSigner = new Contract(
		ADDR_STAKING_POOL,
		StakingPoolABI,
		signer
	)

	const sharesToWithdraw = unbondCommitmentAmountADX
		.mul(balanceShares)
		.div(currentBalanceADX)

	await stakingPoolWithSigner.leave(sharesToWithdraw, false)
}

export async function getTomStakingV5PoolData() {
	const [
		poolTotalStaked,
		mintableIncentive,
		sharesTotalSupply,
		incentivePerSecond,
		rageReceivedPromilles = 700,
		unbondDays = 20,
		shareValue = ZERO
	] = await Promise.all([
		ADXToken.balanceOf(ADDR_STAKING_POOL),
		ADXSupplyController.mintableIncentive(ADDR_STAKING_POOL),
		StakingPool.totalSupply(),
		ADXSupplyController.incentivePerSecond(ADDR_STAKING_POOL),
		StakingPool.RAGE_RECEIVED_PROMILLES(), // TODO
		StakingPool.TIME_TO_UNBOND(), // TODO
		StakingPool.shareValue() // TODO
	])

	return {
		poolTotalStaked,
		mintableIncentive,
		poolTotalBalanceADX: poolTotalStaked.add(mintableIncentive),
		sharesTotalSupply,
		incentivePerSecond,
		shareValue,
		rageReceivedPromilles,
		unbondDays,
		currentAPY: incentivePerSecond.isZero()
			? 0
			: incentivePerSecond
					.mul(PRECISION)
					.mul(secondsInYear)
					.div(poolTotalStaked)
					.toNumber() / PRECISION
	}
}

// to test the ui component
export async function _loadUserTomStakingV5PoolStats({ walletAddr } = {}) {
	const poolData = await getTomStakingV5PoolData()
	if (!walletAddr) {
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
			transactionHash: "0x782536dc0125f6d3dfa801a88df09a4250914fa6"
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.leave,
			withdrawTxHash: 4,
			shares: BigNumber.from(400 + decimalsString),
			maxTokens: BigNumber.from(420 + decimalsString),
			unlockAt: 1608353186,
			blockNumber: 11482093,
			transactionHash: "0x782536dc0125f6d3dfa801a88df09a4250914fa6",
			withdrawTx: {
				label: "Tom Staking Pool V5",
				type: STAKING_POOL_EVENT_TYPES.withdraw,
				shares: BigNumber.from(400 + decimalsString),
				maxTokens: BigNumber.from(420 + decimalsString),
				receivedTokens: BigNumber.from(420 + decimalsString),
				blockNumber: 11661741,
				transactionHash: "4"
			}
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.leave,
			shares: BigNumber.from(480 + decimalsString),
			maxTokens: BigNumber.from(500 + decimalsString),
			unlockAt: 1610340386,
			canWithdraw: true,
			blockNumber: 11482999,
			transactionHash: "0x782536dc0125f6d3dfa801a88df09a4250914fa6"
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.leave,
			shares: BigNumber.from(170 + decimalsString),
			maxTokens: BigNumber.from(200 + decimalsString),
			unlockAt: 1611981986,
			blockNumber: 11481850,
			transactionHash: "0x782536dc0125f6d3dfa801a88df09a4250914fa6"
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.withdraw,
			shares: BigNumber.from(400 + decimalsString),
			maxTokens: BigNumber.from(420 + decimalsString),
			receivedTokens: BigNumber.from(420 + decimalsString),
			blockNumber: 11661741,
			transactionHash: "0x782536dc0125f6d3dfa801a88df09a4250914fa6"
		},
		{
			label: "Tom Staking Pool V5",
			type: STAKING_POOL_EVENT_TYPES.rageLeave,
			shares: BigNumber.from(200 + decimalsString),
			adxAmount: BigNumber.from(220 + decimalsString),
			receivedTokens: BigNumber.from(170 + decimalsString),
			blockNumber: 11789046,
			transactionHash: "0x782536dc0125f6d3dfa801a88df09a4250914fa6"
		}
	]

	const withTimestamp = await Promise.all(
		stakings.map(async stakingEvent => {
			const { timestamp } = await provider.getBlock(stakingEvent.blockNumber)
			return {
				...stakingEvent,
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
	const leavesPendingToUnlockTotalADX = BigNumber.from(490 + decimalsString)
	const leavesReadyToWithdrawTotalADX = BigNumber.from(190 + decimalsString)

	return {
		...STAKING_POOL_EMPTY_STATS,
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
		leavesPendingToUnlockTotalADX,
		leavesReadyToWithdrawTotalADX,
		loaded: true,
		userDataLoaded: true
	}
}

export async function loadUserTomStakingV5PoolStats({ walletAddr } = {}) {
	const owner = walletAddr
	const poolData = await getTomStakingV5PoolData()
	if (!owner) {
		return {
			...STAKING_POOL_EMPTY_STATS,
			...poolData,
			loaded: true
		}
	}

	const [
		balanceShares,
		enterADXTransferLogs,
		leaveLogs,
		withdrawLogs,
		rageLeaveLogs,
		sharesTokensTransfersInLogs,
		sharesTokensTransfersOutLogs
	] = await Promise.all([
		StakingPool.balanceOf(owner),
		provider.getLogs({
			fromBlock: 0,
			...ADXToken.filters.Transfer(owner, ADDR_STAKING_POOL, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogLeave(owner, null, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(ADDR_STAKING_POOL, owner, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogRageLeave(owner, null, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(null, owner, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(owner, null, null)
		})
	])

	const { shareValue, sharesTotalSupply } = poolData

	const currentBalanceADX = balanceShares
		.mul(shareValue)
		.div(POOL_SHARES_TOKEN_DECIMALS_MUL)

	const userShare = sharesTotalSupply.isZero()
		? ZERO
		: balanceShares
				.mul(PRECISION)
				.div(sharesTotalSupply)
				.toNumber() / PRECISION

	const sharesTokensTransfersIn = sharesTokensTransfersInLogs.map(log => {
		const parsedLog = StakingPool.interface.parseLog(log)

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
			} = parsedLog.args

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
		shareTokensTransfersInByTxHash
	} = sharesTokensTransfersIn.reduce(
		(txns, event) => {
			if (event.type === STAKING_POOL_EVENT_TYPES.enter) {
				txns.shareTokensEnterMintByHash[event.transactionHash] = event
			}

			if (event.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferIn) {
				txns.shareTokensTransfersInByTxHash[event.transactionHash] = event
			}

			return txns
		},
		{ shareTokensEnterMintByHash: {}, shareTokensTransfersInByTxHash: {} }
	)

	const sharesTokensTransfersInFromExternal = Object.values(
		shareTokensTransfersInByTxHash
	)

	console.log("enterADXTransferLogs", enterADXTransferLogs)
	const userEnters = enterADXTransferLogs
		.map(log => {
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
			unlockAt,
			maxTokens,
			receivedTokens
		} = parsedWithdrawLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.withdraw,
			shares, //[1]
			unlockAt, //[2]
			maxTokens, //[3]
			receivedTokens, //[4]
			blockNumber: log.blockNumber
		}
	})

	const userRageLeaves = rageLeaveLogs.map(log => {
		const parsedRageLeaveLog = StakingPool.interface.parseLog(log)

		const { shares, maxTokens, receivedTokens } = parsedRageLeaveLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.rageLeave,
			shares, //[1]
			maxTokens, //[2]
			receivedTokens,
			adxAmount: receivedTokens, //[3]
			blockNumber: log.blockNumber
		}
	})

	const now = Date.now() / 1000

	const userLeaves = await Promise.all(
		leaveLogs.map(async log => {
			const parsedLog = StakingPool.interface.parseLog(log)

			const { shares, unlockAt, maxTokens } = parsedLog.args

			const withdrawTx = userWithdraws.find(
				event =>
					event.unlockAt === unlockAt &&
					event.shares === shares &&
					event.maxTokens === maxTokens
			)

			const adxValue = sharesTotalSupply.isZero()
				? ZERO // maxTokens
				: await StakingPool.unbondingCommitmentWorth(owner, shares, unlockAt)

			return {
				transactionHash: log.transactionHash,
				type: STAKING_POOL_EVENT_TYPES.leave,
				shares, // [1]
				unlockAt, //[2]
				maxTokens, // [3]
				adxValue,
				canWithdraw: unlockAt < now && !withdrawTx,
				blockNumber: log.blockNumber,
				withdrawTx
			}
		})
	)

	const leavesPendingToUnlock = [...userLeaves].filter(
		event => event.unlockAt > now
	)

	const leavesReadyToWithdraw = [...userLeaves].filter(
		event => event.unlockAt < now && !event.withdrawTx
	)

	const leavesPendingToUnlockTotalMax = leavesPendingToUnlock.reduce(
		(a, b) => a.add(b.maxTokens),
		ZERO
	)

	const leavesPendingToUnlockTotalADX = leavesPendingToUnlock.reduce(
		(a, b) => a.add(b.adxValue),
		ZERO
	)

	const leavesReadyToWithdrawTotalMax = leavesReadyToWithdraw.reduce(
		(a, b) => a.add(b.maxTokens),
		ZERO
	)

	const leavesReadyToWithdrawTotalADX = leavesReadyToWithdraw.reduce(
		(a, b) => a.add(b.adxValue),
		ZERO
	)

	const stakings = userEnters
		.concat(userLeaves)
		.concat(userWithdraws)
		.concat(userRageLeaves)
		.concat(sharesTokensTransfersInFromExternal)
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

	const {
		// depositsSharesWeightedSum,
		depositsSharesTotal,
		depositsADXTotal
	} = userEnters.reduce(
		(data, log) => {
			data.depositsSharesWeightedSum = data.depositsSharesWeightedSum.add(
				log.shares.mul(log.adxAmount)
			)
			data.depositsSharesTotal = data.depositsSharesTotal.add(log.shares)

			data.depositsADXTotal = data.depositsADXTotal.add(log.adxAmount)

			return data
		},
		{
			depositsSharesWeightedSum: ZERO,
			depositsSharesTotal: ZERO,
			depositsADXTotal: ZERO
		}
	)

	const {
		// withdrawsSharesWeightedSum,
		withdrawsSharesTotal,
		withdrawsADXTotal
	} = userWithdraws.concat(userRageLeaves).reduce(
		(data, log) => {
			data.withdrawsSharesWeightedSum = data.withdrawsSharesWeightedSum.add(
				log.shares.mul(log.adxAmount)
			)
			data.withdrawsSharesTotal = data.withdrawsSharesTotal.add(log.shares)

			data.withdrawsADXTotal = data.withdrawsADXTotal.add(log.adxAmount)

			return data
		},
		{
			withdrawsSharesWeightedSum: ZERO,
			withdrawsSharesTotal: ZERO,
			withdrawsADXTotal: ZERO
		}
	)

	const totalSharesOutTransfers = sharesTokensTransfersOut.reduce(
		(a, b) => a.shares.add(b.shares),
		ZERO
	)
	const totalSharesInTransfers = sharesTokensTransfersInFromExternal.reduce(
		(a, b) => a.shares.add(b.shares),
		ZERO
	)

	const avgDepositShareValue = depositsADXTotal.isZero()
		? ZERO
		: depositsADXTotal
				.mul(POOL_SHARES_TOKEN_DECIMALS_MUL)
				.div(depositsSharesTotal)

	const avgWithdrawShareValue = withdrawsADXTotal.isZero()
		? ZERO
		: withdrawsADXTotal
				.mul(POOL_SHARES_TOKEN_DECIMALS_MUL)
				.div(withdrawsSharesTotal)

	// TODO: depositsSharesTotal instead balanceShares ??
	const totalRewards = depositsSharesTotal
		.mul(avgWithdrawShareValue.sub(avgDepositShareValue))
		.div(POOL_SHARES_TOKEN_DECIMALS_MUL)

	const stats = {
		...poolData,
		balanceShares,
		currentBalanceADX,
		totalRewards,
		totalSharesInTransfers,
		totalSharesOutTransfers,
		stakings: withTimestamp,
		userLeaves,
		depositsADXTotal,
		withdrawsADXTotal,
		leavesPendingToUnlockTotalMax,
		leavesReadyToWithdrawTotalMax,
		leavesPendingToUnlockTotalADX,
		leavesReadyToWithdrawTotalADX,
		loaded: true,
		userDataLoaded: true,
		userShare
	}

	console.log("stats", stats)

	return stats
}
