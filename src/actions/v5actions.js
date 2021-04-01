import { Contract, BigNumber, utils } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXTokenABI from "../abi/ADXToken"
// import StakingABI from "adex-protocol-eth/abi/Staking"
import ADXSupplyControllerABI from "../abi/ADXSupplyController"
import StakingMigratorABI from "../abi/StakingMigrator.json"
import StakingPoolABI from "../abi/StakingPool.json"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import {
	ADDR_ADX,
	// ADDR_STAKING,
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

// const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
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
	hasActiveUnbondCommitments: false,
	leavesPendingToUnlockTotalMax: ZERO,
	leavesReadyToWithdrawTotalMax: ZERO,
	leavesPendingToUnlockTotalADX: ZERO,
	leavesReadyToWithdrawTotalADX: ZERO,
	unbondDays: 33,
	loaded: false,
	userDataLoaded: false,
	rageReceivedPromilles: 700,
	timeToUnbond: 1,
	userShare: 0
}

export async function onMigrationToV5Finalize(
	chosenWalletType,
	{ amount, poolId, nonce },
	claimPendingRewards,
	stakeWalletBalance,
	withdrawOnMigration, // TODO: check it here
	stats,
	enterTo
) {
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")
	const walletAddr = await signer.getAddress()

	const interactionAddress = enterTo ? utils.getAddress(enterTo) : walletAddr

	const { userWalletBalance, tomPoolStats } = stats
	const {
		identityADXIncentiveChannels,
		identityAdxRewardsAmount
	} = tomPoolStats

	const willWithdrawOnMigration = withdrawOnMigration

	const identityTxns = []

	let extraAmount = ZERO

	if (claimPendingRewards) {
		identityADXIncentiveChannels.forEach(channel => {
			const channelTuple = toChannelTuple(channel.channelArgs)
			identityTxns.push([
				Core.address,
				Core.interface.encodeFunctionData("channelWithdraw", [
					channelTuple,
					channel.stateRoot,
					channel.signatures,
					channel.proof,
					channel.amount
				])
			])
		})

		identityTxns.push([
			ADXToken.address,
			ADXToken.interface.encodeFunctionData("transfer", [
				willWithdrawOnMigration ? interactionAddress : ADDR_STAKING_MIGRATOR,
				identityAdxRewardsAmount
			])
		])

		extraAmount = extraAmount.add(identityAdxRewardsAmount)
	}

	// TODO: check allowance
	if (!willWithdrawOnMigration && stakeWalletBalance) {
		identityTxns.push([
			ADXToken.address,
			ADXToken.interface.encodeFunctionData("transferFrom", [
				walletAddr,
				ADDR_STAKING_MIGRATOR,
				userWalletBalance
			])
		])

		extraAmount = extraAmount.add(userWalletBalance)
	}

	await executeOnIdentity(
		chosenWalletType,
		[
			...identityTxns,
			[
				StakingMigrator.address,
				StakingMigrator.interface.encodeFunctionData("migrate", [
					amount,
					nonce,
					interactionAddress,
					extraAmount
				])
			]
		],
		{},
		false,
		claimPendingRewards || (!willWithdrawOnMigration && stakeWalletBalance)
			? 16_000
			: null
	)
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
		setAllowance ? { gasLimit: 136000 } : {}
	)
}

export async function onStakingPoolV5Withdraw(
	stats,
	chosenWalletType,
	_,
	unbondCommitment
) {
	if (!stats) throw new Error("errors.statsNotProvided")
	if (!unbondCommitment) throw new Error("errors.noUnbondCommitmentProvided")
	// TODO: validate unbondCommitment

	const signer = await getSigner(chosenWalletType)

	const stakingPoolWithSigner = new Contract(
		ADDR_STAKING_POOL,
		StakingPoolABI,
		signer
	)

	const { shares, unlocksAt } = unbondCommitment

	await stakingPoolWithSigner.withdraw(shares, unlocksAt, false)
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
		rageReceivedPromilles = BigNumber.from(700),
		unbondDays = ZERO,
		shareValue = ZERO
	] = await Promise.all([
		ADXToken.balanceOf(ADDR_STAKING_POOL),
		ADXSupplyController.mintableIncentive(ADDR_STAKING_POOL),
		StakingPool.totalSupply(),
		ADXSupplyController.incentivePerSecond(ADDR_STAKING_POOL),
		StakingPool.rageReceivedPromilles(), // TODO
		StakingPool.timeToUnbond(), // TODO
		StakingPool.shareValue() // TODO
	])

	return {
		poolTotalStaked,
		mintableIncentive,
		poolTotalBalanceADX: poolTotalStaked.add(mintableIncentive),
		sharesTotalSupply,
		incentivePerSecond,
		shareValue,
		rageReceivedPromilles: rageReceivedPromilles.toNumber(),
		unbondDays: unbondDays.div(60 * 60 * 24).toNumber(),
		currentAPY: incentivePerSecond.isZero()
			? 0
			: incentivePerSecond
					.mul(PRECISION)
					.mul(secondsInYear)
					.div(poolTotalStaked)
					.toNumber() / PRECISION
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
		allEnterADXTransferLogs,
		leaveLogs,
		withdrawLogs,
		rageLeaveLogs,
		sharesTokensTransfersInLogs,
		sharesTokensTransfersOutLogs
	] = await Promise.all([
		StakingPool.balanceOf(owner),
		provider.getLogs({
			fromBlock: 0,
			...ADXToken.filters.Transfer(null, ADDR_STAKING_POOL, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogLeave(owner, null, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogWithdraw(owner, null, null, null, null)
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

	const enterAdexTokensByTxHash = allEnterADXTransferLogs.reduce(
		(byHash, log) => {
			byHash[log.transactionHash] = log
			return byHash
		},
		{}
	)

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

	const userEnters = Object.values(shareTokensEnterMintByHash)
		.map(sharesMintEvent => {
			const adexTokenTransfersLog =
				enterAdexTokensByTxHash[sharesMintEvent.transactionHash]

			if (adexTokenTransfersLog) {
				const parsedAdxLog = ADXToken.interface.parseLog(adexTokenTransfersLog)

				return {
					transactionHash: sharesMintEvent.transactionHash,
					type: STAKING_POOL_EVENT_TYPES.enter,
					shares: sharesMintEvent.shares,
					adxAmount: parsedAdxLog.args.amount, // [2]
					from: parsedAdxLog.args.from,
					blockNumber: sharesMintEvent.blockNumber
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

			const { shares, unlocksAt, maxTokens } = parsedLog.args

			const withdrawTx = userWithdraws.find(
				event =>
					event.unlocksAt.toString() === unlocksAt.toString() &&
					event.shares.toString() === shares.toString() &&
					event.maxTokens.toString() === maxTokens.toString()
			)

			const adxValue = sharesTotalSupply.isZero()
				? ZERO // maxTokens
				: await StakingPool.unbondingCommitmentWorth(owner, shares, unlocksAt)

			return {
				transactionHash: log.transactionHash,
				type: STAKING_POOL_EVENT_TYPES.leave,
				shares, // [1]
				unlocksAt, //[2]
				maxTokens, // [3]
				adxValue,
				canWithdraw: unlocksAt < now && !withdrawTx,
				blockNumber: log.blockNumber,
				withdrawTx
			}
		})
	)

	const leavesPendingToUnlock = [...userLeaves].filter(
		event => event.unlocksAt > now
	)

	const leavesReadyToWithdraw = [...userLeaves].filter(
		event => event.unlocksAt < now && !event.withdrawTx
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
		.sort((a, b) => a.blockNumber - b.blockNumber)

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
		// depositsSharesTotal,
		depositsADXTotal
	} = userEnters.reduce(
		(data, log) => {
			// data.depositsSharesWeightedSum = data.depositsSharesWeightedSum.add(
			// 	log.shares.mul(log.adxAmount)
			// )
			// data.depositsSharesTotal = data.depositsSharesTotal.add(log.shares)

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
		// withdrawsSharesTotal,
		withdrawsADXTotal
	} = userWithdraws.concat(userRageLeaves).reduce(
		(data, log) => {
			// data.withdrawsSharesWeightedSum = data.withdrawsSharesWeightedSum.add(
			// 	log.shares.mul(log.adxAmount)
			// )
			// data.withdrawsSharesTotal = data.withdrawsSharesTotal.add(log.shares)

			data.withdrawsADXTotal = data.withdrawsADXTotal.add(log.receivedTokens)

			return data
		},
		{
			withdrawsSharesWeightedSum: ZERO,
			withdrawsSharesTotal: ZERO,
			withdrawsADXTotal: ZERO
		}
	)

	const totalSharesOutTransfers = sharesTokensTransfersOut.reduce(
		(a, b) => a.add(b.shares),
		ZERO
	)

	const totalSharesInTransfers = sharesTokensTransfersInFromExternal.reduce(
		(a, b) => a.add(b.shares),
		ZERO
	)

	const totalRewards = currentBalanceADX
		.add(withdrawsADXTotal)
		// .add(leavesPendingToUnlockTotalADX)
		// .add(leavesReadyToWithdrawTotalADX)
		.sub(depositsADXTotal)

	const hasActiveUnbondCommitments = !![...userLeaves].filter(
		x => !x.withdrawTx
	).length

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
		hasActiveUnbondCommitments,
		loaded: true,
		userDataLoaded: true,
		userShare
	}

	return stats
}
