import { Contract } from "ethers"
import { BigNumber, utils } from "ethers"
import BalanceTree from "adex-protocol-eth/js/BalanceTree"
import StakingABI from "adex-protocol-eth/abi/Staking"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import ERC20ABI from "../abi/ERC20"
import StakingMigratorABI from "../abi/StakingMigrator.json"
import {
	ADDR_STAKING,
	ADDR_ADX,
	MAX_UINT,
	ZERO,
	POOLS,
	ADDR_CORE,
	ADDR_STAKING_MIGRATOR
} from "../helpers/constants"
import { getBondId } from "../helpers/bonds"
import { getUserIdentity } from "../helpers/identity"
import { ADEX_RELAYER_HOST } from "../helpers/constants"
import { getSigner, getDefaultProvider } from "../ethereum"
import {
	loadUserLoyaltyPoolsStats,
	LOYALTY_POOP_EMPTY_STATS
} from "./loyaltyPoolActions"
import { executeOnIdentity, toChannelTuple } from "./common"
import {
	STAKING_POOL_EMPTY_STATS,
	loadUserTomStakingV5PoolStats
} from "./v5actions"

const defaultProvider = getDefaultProvider

// const ADDR_ADX_OLD = "0x4470bb87d77b963a013db939be332f927f2b992e"

const Staking = new Contract(ADDR_STAKING, StakingABI, defaultProvider)
const Token = new Contract(ADDR_ADX, ERC20ABI, defaultProvider)
const Core = new Contract(ADDR_CORE, CoreABI, defaultProvider)
const StakingMigrator = new Contract(
	ADDR_STAKING_MIGRATOR,
	StakingMigratorABI,
	defaultProvider
)

const MAX_SLASH = BigNumber.from("1000000000000000000")
const SECONDS_IN_YEAR = 365 * 24 * 60 * 60

// 0.2 DAI or ADX
const OUTSTANDING_REWARD_THRESHOLD = BigNumber.from("200000000000000000")

export const POOL_EMPTY_STATS = {
	totalStake: ZERO,
	totalCurrentTotalActiveStake: ZERO,
	currentAdxIncentiveAPY: 0,
	lastDaiFeesAPY: 0,
	totalAPY: 0,
	userRewardsADX: ZERO,
	userRewardsDAI: ZERO,
	loaded: false,
	userDataLoaded: false,
	rewardChannels: [],
	userBonds: []
}

export const EMPTY_STATS = {
	connectedWalletAddress: null,
	loaded: false,
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO,
	totalStakeTom: ZERO,
	rewardChannels: [],
	identityADXIncentiveChannels: [],
	identityAdxRewardsAmount: ZERO,
	totalRewardADX: ZERO,
	totalRewardDAI: ZERO,
	tomRewardADX: ZERO,
	totalLockedOnDeposits: ZERO,
	totalPendingToUnlock: ZERO,
	totalUnlockedDeposits: ZERO,
	totalStakings: ZERO,
	apyTomADX: 0,
	userTotalStake: ZERO,
	totalBalanceADX: ZERO,
	userWalletBalance: ZERO,
	userIdentityBalance: ZERO,
	// canExecuteGasless: false,
	// canExecuteGaslessError: null,
	loyaltyPoolStats: LOYALTY_POOP_EMPTY_STATS,
	tomPoolStats: POOL_EMPTY_STATS,
	tomStakingV5PoolStats: STAKING_POOL_EMPTY_STATS,
	prices: {},
	legacyTokenBalance: ZERO,
	identityDeployed: false
}

const sumRewards = all =>
	all.map(x => x.outstandingReward).reduce((a, b) => a.add(b), ZERO)

export const isTomChannelId = channel =>
	channel.channelArgs.validators.some(
		val => utils.id(`validator:${val}`) === POOLS[0].id
	)

export function getIncentiveChannelCurrentAPY({ channel, totalStake }) {
	const { periodEnd, stats = {} } = channel

	const {
		currentRewardPerSecond = "478927203065134100",
		currentTotalActiveStake
	} = stats

	const poolTotalStake = BigNumber.from(currentTotalActiveStake || totalStake)
	const distributionEnds = new Date(periodEnd).getTime()
	const now = Date.now()

	if (now >= distributionEnds) {
		return 0
	}

	const secondsLeft = Math.floor((distributionEnds - now) / 1000)

	const toDistribute = BigNumber.from(currentRewardPerSecond).mul(secondsLeft)

	const precision = 10_000_000

	const apy = toDistribute
		.mul(SECONDS_IN_YEAR)
		.mul(precision)
		.div(secondsLeft)
		.div(poolTotalStake)

	return apy.toNumber() / precision
}

export function getValidatorFeesAPY({ channel, prices, totalStake }) {
	if (!channel) {
		return 0
	}

	const { periodStart, periodEnd, channelArgs, stats = {} } = channel
	const { tokenAmount } = channelArgs
	const { currentTotalActiveStake } = stats

	const totalActiveStaked = BigNumber.from(
		currentTotalActiveStake || totalStake || 0
	)
	const pricePrecision = 1_000_000

	const totalStakeInDaiValue = BigNumber.from(totalActiveStaked)
		.mul(BigNumber.from(Math.floor((prices.USD || 0.2) * pricePrecision)))
		.div(pricePrecision)

	const toDistribute = BigNumber.from(tokenAmount)

	const distributionSeconds = Math.floor(
		(new Date(periodEnd) - new Date(periodStart)) / 1000
	)

	const apy = toDistribute
		.mul(1000)
		.mul(
			BigNumber.from(SECONDS_IN_YEAR)
				.mul(1000)
				.div(distributionSeconds)
		)
		.div(totalStakeInDaiValue)

	return apy.toNumber() / (1000 * 1000)
}

function getChannelAPY({ channel, prices, totalStake, type }) {
	if (type === "fees") {
		return getValidatorFeesAPY({ channel, prices, totalStake })
	}
	if (type === "incentive") {
		return getIncentiveChannelCurrentAPY({ channel, totalStake })
	}
}

export async function loadStats(chosenWalletType, prices) {
	const [totalStake, userStats] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserStats(chosenWalletType, prices)
	])

	return { ...userStats, ...totalStake, totalStakeTom: totalStake }
}

export async function loadActivePoolsStats(prices) {
	const tomPoolStats = await getPoolStats(POOLS[0], prices)

	return { tomPoolStats }
}

export async function getPoolStats(pool, prices) {
	const rewardChannels = await getRewardChannels(pool)
	const totalStake = await Token.balanceOf(ADDR_STAKING)

	const now = Date.now()

	const adxIncentiveRewardsChannels = rewardChannels.filter(
		x =>
			x.channelArgs.tokenAddr === ADDR_ADX &&
			// hack to remove the legacy channel which ended 3 days earlier than periodEnd
			x._id !==
				"0x30d87bab0ef1e7f8b4c3b894ca2beed41bbd54c481f31e5791c1e855c9dbf4ba" &&
			now <= new Date(x.periodEnd).getTime() &&
			now > new Date(x.periodStart).getTime()
	)

	const feeRewardsChannels = rewardChannels.filter(
		x => x.channelArgs.tokenAddr !== ADDR_ADX
	)

	const currentActiveIncentiveChannels = adxIncentiveRewardsChannels.sort(
		(a, b) => b.channelArgs.validUntil - a.channelArgs.validUntil
	)

	const lastFeeRewardChannel = feeRewardsChannels.sort(
		(a, b) => b.channelArgs.validUntil - a.channelArgs.validUntil
	)[0]

	const totalCurrentTotalActiveStake = currentActiveIncentiveChannels.reduce(
		(totalCurrent, channel) =>
			totalCurrent.add((channel.stats || {}).currentTotalActiveStake || ZERO),
		ZERO
	)

	const currentAdxIncentiveAPY = currentActiveIncentiveChannels.reduce(
		(totalAPY, channel) =>
			totalAPY +
			getIncentiveChannelCurrentAPY({
				channel,
				totalStake: totalCurrentTotalActiveStake
			}),
		0
	)

	const lastDaiFeesAPY = getValidatorFeesAPY({
		channel: lastFeeRewardChannel,
		totalStake,
		prices
	})

	const stats = {
		...POOL_EMPTY_STATS,
		currentAdxIncentiveAPY,
		lastDaiFeesAPY,
		totalAPY: currentAdxIncentiveAPY + lastDaiFeesAPY,
		loaded: true,
		totalStake,
		totalCurrentTotalActiveStake
	}

	return stats
}

export async function loadUserStats(chosenWalletType, prices) {
	const totalStake = await Token.balanceOf(ADDR_STAKING)

	if (!chosenWalletType.name) {
		const loyaltyPoolStats = await loadUserLoyaltyPoolsStats()
		const poolStats = await loadActivePoolsStats(prices)
		const tomStakingV5PoolStats = await loadUserTomStakingV5PoolStats()

		return {
			...EMPTY_STATS,
			loyaltyPoolStats,
			...poolStats,
			tomStakingV5PoolStats,
			prices,
			loaded: true
		}
	}

	const signer = await getSigner(chosenWalletType)
	if (!signer) return { ...EMPTY_STATS, loaded: true }

	const addr = await signer.getAddress()
	const identityAddr = getUserIdentity(addr).addr
	const identityDeployed =
		(await defaultProvider.getCode(identityAddr)) !== "0x"

	const [
		{
			userBonds: userBondsData,
			userBalance,
			userWalletBalance,
			userIdentityBalance
		},
		tomPoolUserRewardChannels,
		// { canExecuteGasless, canExecuteGaslessError },
		loyaltyPoolStats,
		poolsStats,
		tomStakingV5PoolStatsWithUserData,
		migrationBonusPromille = 97
	] = await Promise.all([
		loadBondStats(addr, identityAddr), // TODO: TOM only at the moment
		getRewards(addr, POOLS[0], prices, totalStake),
		// getGaslessInfo(addr),
		loadUserLoyaltyPoolsStats(addr),
		loadActivePoolsStats(prices),
		loadUserTomStakingV5PoolStats({ walletAddr: addr }),
		// StakingMigrator.BONUS_PROMILLES()
		undefined
	])

	const { tomPoolStats } = poolsStats

	const tomAdxRewardsChannels = [...tomPoolUserRewardChannels].filter(
		x => x.type === "incentive"
	)

	const identityADXIncentiveChannels = [...tomAdxRewardsChannels].filter(
		channel => channel.claimFrom !== addr && channel.outstandingReward.gt(ZERO)
	)

	const identityAdxRewardsAmount = sumRewards(identityADXIncentiveChannels)

	const tomRewardADX = sumRewards(tomAdxRewardsChannels)

	const tomPoolDaiRewardsChannels = [...tomPoolUserRewardChannels].filter(
		x => x.type === "fees"
	)

	const tomRewardDAI = sumRewards(tomPoolDaiRewardsChannels)

	console.log("migrationBonusPromille", migrationBonusPromille)
	console.log("identityAdxRewardsAmount", identityAdxRewardsAmount)

	const userBonds = userBondsData.map(bond => ({
		...bond,
		migrationReward:
			bond.status === "MigrationRequested"
				? bond.amount
						.add(identityAdxRewardsAmount)
						.mul(migrationBonusPromille)
						.div(1000)
				: // Min migration reward when "Active" as the full reward is based ont the total migration
				// amount that includes current rewards in the time of migration finalization
				bond.status === "Active"
				? bond.amount.mul(migrationBonusPromille).div(1000)
				: null
	}))

	console.log("userBonds", userBonds)

	const userTotalStake = userBonds
		.filter(x => x.status === "Active")
		.map(x => x.currentAmount)
		.reduce((a, b) => a.add(b), ZERO)

	// NOTE: with the migration enabled All unbond requests will be available for withdraw
	const tomUnbondRequestedWithdraw = userBonds
		.filter(x => x.status === "UnbondRequested")
		.map(x => x.currentAmount)
		.reduce((a, b) => a.add(b), ZERO)

	const tomPoolStatsWithUserData = {
		...tomPoolStats,
		identityADXIncentiveChannels,
		identityAdxRewardsAmount,
		userRewardsADX: tomRewardADX,
		userRewardsDAI: tomRewardDAI,
		userDataLoaded: true,
		rewardChannels: tomPoolUserRewardChannels,
		userBonds
	}

	const {
		currentBalanceADX,
		leavesPendingToUnlockTotalADX,
		leavesReadyToWithdrawTotalADX
	} = tomStakingV5PoolStatsWithUserData

	const { balanceLpADX } = loyaltyPoolStats

	const totalLockedOnDeposits = currentBalanceADX

	const totalPendingToUnlock = leavesPendingToUnlockTotalADX
	const totalUnlockedDeposits = balanceLpADX.add(leavesReadyToWithdrawTotalADX)

	const totalStakings = userTotalStake
		.add(totalLockedOnDeposits)
		.add(totalPendingToUnlock)
		.add(totalUnlockedDeposits)
		.add(tomUnbondRequestedWithdraw)

	const totalBalanceADX = userBalance.add(tomRewardADX).add(totalStakings)

	return {
		identityAddr,
		identityDeployed,
		connectedWalletAddress: addr,
		userBonds,
		userBalance, // ADX on wallet
		loaded: true,
		rewardChannels: tomPoolUserRewardChannels,
		totalRewardADX: tomRewardADX,
		totalRewardDAI: tomRewardDAI,
		tomRewardADX,
		userTotalStake,
		totalStakings,
		totalBalanceADX, // Wallet + Stake + Reward
		userWalletBalance,
		userIdentityBalance,
		totalLockedOnDeposits,
		totalUnlockedDeposits,
		totalPendingToUnlock,
		// canExecuteGasless,
		// canExecuteGaslessError,
		loyaltyPoolStats,
		tomPoolStats: tomPoolStatsWithUserData,
		tomStakingV5PoolStats: tomStakingV5PoolStatsWithUserData,
		prices
	}
}

export async function loadBondStats(addr, identityAddr) {
	const [
		[userWalletBalance, userIdentityBalance],
		logs,
		slashLogs,
		migrationLogs
	] = await Promise.all([
		Promise.all([Token.balanceOf(addr), Token.balanceOf(identityAddr)]),
		defaultProvider.getLogs({
			fromBlock: 0,
			address: ADDR_STAKING,
			topics: [null, utils.hexZeroPad(identityAddr, 32)]
		}),
		defaultProvider.getLogs({
			fromBlock: 0,
			...Staking.filters.LogSlash(null, null)
		}),
		defaultProvider.getLogs({
			fromBlock: 0,
			...StakingMigrator.filters.LogBondMigrated(null)
		})
	])

	const userBalance = userWalletBalance.add(userIdentityBalance)

	const slashedByPool = slashLogs.reduce((pools, log) => {
		const { poolId, newSlashPts } = Staking.interface.parseLog(log).args
		pools[poolId] = newSlashPts
		return pools
	}, {})

	const migrationLogsByBondId = migrationLogs.reduce((byHash, log) => {
		const { bondId } = StakingMigrator.interface.parseLog(log).args
		byHash[bondId] = log
		return byHash
	}, {})

	const userBonds = logs.reduce((bonds, log) => {
		const topic = log.topics[0]
		// TODO: add is migrations Unbond request and migrated status
		// status = "MigrationRequested"

		if (topic === Staking.interface.getEventTopic("LogBond")) {
			const vals = Staking.interface.parseLog(log).args
			const { owner, amount, poolId, nonce, slashedAtStart, time } = vals
			const bond = { owner, amount, poolId, nonce, slashedAtStart, time }

			const id = getBondId(bond)

			const bondMigrationLog = migrationLogsByBondId[id]

			const bondWithData = {
				id,
				status: bondMigrationLog ? "Migrated" : "Active",
				currentAmount: bond.amount,
				// .mul(MAX_SLASH.sub(slashedByPool[poolId] || ZERO))
				// .div(MAX_SLASH.sub(slashedAtStart)),
				...bond
			}

			const replacedBondIndex = bonds.findIndex(x => x.id === bondWithData.id)

			if (replacedBondIndex > -1) {
				bonds[replacedBondIndex] = bondWithData
			} else {
				bonds.push(bondWithData)
			}
		} else if (
			topic === Staking.interface.getEventTopic("LogUnbondRequested")
		) {
			// NOTE: assuming that .find() will return something is safe, as long as the logs are properly ordered
			const { bondId, willUnlock } = Staking.interface.parseLog(log).args
			const bond = bonds.find(({ id }) => id === bondId)

			if (bond.status !== "Migrated") {
				bond.status = "UnbondRequested"
			}

			bond.willUnlock = new Date(willUnlock * 1000)
		} else if (topic === Staking.interface.getEventTopic("LogUnbonded")) {
			const { bondId } = Staking.interface.parseLog(log).args
			const bond = bonds.find(({ id }) => id === bondId)
			bond.status = "Unbonded"
		}

		return bonds
	}, [])

	return {
		userBonds,
		userBalance,
		userWalletBalance,
		userIdentityBalance
	}
}

export async function getRewardChannels(rewardPool) {
	const resp = await fetch(`${rewardPool.url}/fee-rewards`)
	const rewardChannels = await resp.json()
	return rewardChannels
}

export async function getRewards(addr, rewardPool, prices, totalStake) {
	const identityAddr = getUserIdentity(addr).addr
	const rewardChannels = await getRewardChannels(rewardPool)
	const validUntil = Math.floor(Date.now() / 1000)
	const forUser = await Promise.all(
		rewardChannels.map(async rewardChannel => {
			if (rewardChannel.channelArgs.validUntil < validUntil) return null
			const claimFrom = rewardChannel.balances[addr] ? addr : identityAddr
			if (!rewardChannel.balances[claimFrom]) return null
			const balanceTree = new BalanceTree(rewardChannel.balances)
			const outstandingReward = BigNumber.from(
				rewardChannel.balances[claimFrom]
			).sub(await Core.withdrawnPerUser(rewardChannel.channelId, claimFrom))
			const type =
				rewardChannel.channelArgs.tokenAddr === ADDR_ADX ? "incentive" : "fees"

			// Min threshold only for fees channels
			if (type === "fees" && outstandingReward.lt(OUTSTANDING_REWARD_THRESHOLD))
				return null

			return {
				...rewardChannel,
				outstandingReward,
				claimFrom,
				proof: balanceTree.getProof(claimFrom),
				stateRoot: balanceTree.mTree.getRoot(),
				amount: rewardChannel.balances[claimFrom],
				type,
				currentAPY: getChannelAPY({
					channel: rewardChannel,
					prices,
					totalStake,
					type
				}),
				poolId: rewardPool.id
			}
		})
	)
	return forUser.filter(x => x)
}

export async function getGaslessInfo(addr) {
	try {
		const res = await fetch(`${ADEX_RELAYER_HOST}/staking/${addr}/can-execute`)
		const resData = await res.json()
		const canExecuteGasless = res.status === 200 && resData.canExecute === true
		const canExecuteGaslessError = canExecuteGasless
			? null
			: {
					message: `relayerResErrors.${resData.message}`,
					data: resData.data
			  }

		return {
			canExecuteGasless,
			canExecuteGaslessError
		}
	} catch (err) {
		console.error(err)
		return {
			canExecuteGasless: false,
			canExecuteGaslessError: {
				message: "errors.gaslessStakingTempOff"
			}
		}
	}
}

export async function createNewBond(
	stats,
	chosenWalletType,
	{ amount, poolId, nonce },
	gasless
) {
	if (!poolId) return
	if (!stats.userBalance) return
	if (amount.gt(stats.userBalance)) throw new Error("errors.amountTooLarge")

	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")

	const walletAddr = await signer.getAddress()
	const { addr } = getUserIdentity(walletAddr)

	const bond = [
		amount,
		poolId,
		nonce || BigNumber.from(Math.floor(Date.now() / 1000))
	]

	const [allowance, allowanceStaking, balanceOnIdentity] = await Promise.all([
		Token.allowance(walletAddr, addr),
		Token.allowance(addr, Staking.address),
		Token.balanceOf(addr)
	])

	// Edge case: if we're gasless, the ADX is already on the identity and it's not deployed (constructor will be executed)
	if (
		gasless &&
		amount.eq(balanceOnIdentity) &&
		(await defaultProvider.getCode(addr)) === "0x"
	) {
		return executeOnIdentity(chosenWalletType, [], {}, true)
	}
	// @TODO consider handling this edge case in non-gasless cases when there's some ADX on the identity
	// or at least `if (needsDeploying && balanceOnIdentity.gt(ZERO)) throw` cause otherwise the tx would just fail
	// because the constructor will bond this amount first
	// see https://github.com/AdExNetwork/adex-staking/issues/71

	// Eg bond amount is 10 but we only have 60, we need another 40
	const needed = amount.sub(balanceOnIdentity)
	const setAllowance = needed.gt(ZERO) && !allowance.gte(amount)
	if (setAllowance) {
		const tokenWithSigner = new Contract(ADDR_ADX, ERC20ABI, signer)
		await tokenWithSigner.approve(addr, MAX_UINT)
	}

	if (
		!stats.identityDeployed &&
		balanceOnIdentity.gt(ZERO) &&
		needed.gt(ZERO)
	) {
		throw new Error("errors.cantDeployAndStakeMore")
	}

	let identityTxns = []
	if (needed.gt(ZERO))
		identityTxns.push([
			Token.address,
			Token.interface.encodeFunctionData("transferFrom", [
				walletAddr,
				addr,
				needed
			])
		])
	if (allowanceStaking.lt(amount))
		identityTxns.push([
			Token.address,
			Token.interface.encodeFunctionData("approve", [Staking.address, MAX_UINT])
		])

	const active = stats.userBonds.find(
		x => x.status === "Active" && x.poolId === poolId
	)
	const stakingData = active
		? Staking.interface.encodeFunctionData("replaceBond", [
				active,
				[active.amount.add(amount), poolId, active.nonce]
		  ])
		: Staking.interface.encodeFunctionData("addBond", [bond])
	identityTxns.push([Staking.address, stakingData])

	return executeOnIdentity(
		chosenWalletType,
		identityTxns,
		setAllowance ? { gasLimit: 450000 } : {},
		gasless
	)
}

export async function onUnbondOrRequest(
	isUnbond,
	chosenWalletType,
	{ amount, poolId, nonce }
) {
	const bond = [amount, poolId, nonce || ZERO]
	if (isUnbond) {
		const signer = await getSigner(chosenWalletType)
		if (!signer) throw new Error("errors.failedToGetSigner")
		const walletAddr = await signer.getAddress()
		await executeOnIdentity(chosenWalletType, [
			[Staking.address, Staking.interface.encodeFunctionData("unbond", [bond])],
			[
				Token.address,
				Token.interface.encodeFunctionData("transfer", [walletAddr, amount])
			]
		])
	} else {
		await executeOnIdentity(chosenWalletType, [
			[
				Staking.address,
				Staking.interface.encodeFunctionData("requestUnbond", [bond])
			]
		])
	}
}

export async function claimRewards(chosenWalletType, rewardChannels) {
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")
	const walletAddr = await signer.getAddress()

	// @TODO: this is obsolete, it should be removed at some point (when no more DAI rewards on wallets are left)
	const coreWithSigner = new Contract(ADDR_CORE, CoreABI, signer)
	const legacyChannels = rewardChannels.filter(
		channel => channel.claimFrom === walletAddr
	)
	for (const channel of legacyChannels) {
		const channelTuple = toChannelTuple(channel.channelArgs)
		await coreWithSigner.channelWithdraw(
			channelTuple,
			channel.stateRoot,
			channel.signatures,
			channel.proof,
			channel.amount
		)
	}

	const identityChannels = rewardChannels.filter(
		channel => channel.claimFrom !== walletAddr
	)
	const toTransfer = {}
	identityChannels.forEach(channel => {
		const { tokenAddr } = channel.channelArgs
		const amnt = toTransfer[tokenAddr] || ZERO
		toTransfer[tokenAddr] = amnt.add(channel.outstandingReward)
	})
	const identityTxns = identityChannels
		.map(channel => {
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
		.concat(
			Object.entries(toTransfer).map(([tokenAddr, amount]) => [
				tokenAddr,
				Token.interface.encodeFunctionData("transfer", [walletAddr, amount])
			])
		)

	if (identityTxns.length) {
		await executeOnIdentity(chosenWalletType, identityTxns)
	}
}

export async function restake(
	chosenWalletType,
	{ rewardChannels, userBonds },
	gasless
) {
	const channels = rewardChannels.filter(
		x =>
			x.channelArgs.tokenAddr === ADDR_ADX &&
			(gasless ? isTomChannelId(x) : true)
	)
	if (!channels.length) throw new Error("errors.noChannelsToEarnFrom")

	// @TODO how does the user determine the pool here? For now there's only one, but after?
	const collected = channels
		.map(x => x.outstandingReward)
		.reduce((a, b) => a.add(b))
	const userBond =
		userBonds.find(x => x.status === "Active") ||
		userBonds.find(x => x.status === "UnbondRequested")
	if (!userBond) throw new Error("errors.noActiveBonds")
	const { amount, poolId, nonce } = userBond
	const bond = [amount, poolId, nonce]
	const newBond = [amount.add(collected), poolId, nonce]

	const identityTxns = channels
		.map(rewardChannel => {
			const channelTuple = toChannelTuple(rewardChannel.channelArgs)
			return [
				Core.address,
				Core.interface.encodeFunctionData("channelWithdraw", [
					channelTuple,
					rewardChannel.stateRoot,
					rewardChannel.signatures,
					rewardChannel.proof,
					rewardChannel.amount
				])
			]
		})
		.concat([
			[
				Token.address,
				Token.interface.encodeFunctionData("approve", [
					Staking.address,
					newBond[0]
				])
			],
			[
				Staking.address,
				Staking.interface.encodeFunctionData("replaceBond", [bond, newBond])
			]
		])

	return executeOnIdentity(chosenWalletType, identityTxns, {}, gasless)
}

export async function reBond(chosenWalletType, { amount, poolId, nonce }) {
	const bond = [amount, poolId, nonce || ZERO]
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")
	const walletAddr = await signer.getAddress()
	const { addr } = getUserIdentity(walletAddr)
	const allowanceStaking = await Token.allowance(addr, Staking.address)
	return executeOnIdentity(
		chosenWalletType,
		(allowanceStaking.lt(amount)
			? [
					[
						Token.address,
						Token.interface.encodeFunctionData("approve", [
							Staking.address,
							MAX_UINT
						])
					]
			  ]
			: []
		).concat([
			[
				Staking.address,
				Staking.interface.encodeFunctionData("replaceBond", [bond, bond])
			]
		])
	)
}
