import { Contract, getDefaultProvider } from "ethers"
import { bigNumberify, hexZeroPad } from "ethers/utils"
import BalanceTree from "adex-protocol-eth/js/BalanceTree"
import { splitSig } from "adex-protocol-eth/js"
import StakingABI from "adex-protocol-eth/abi/Staking"
import IdentityABI from "adex-protocol-eth/abi/Identity"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import FactoryABI from "adex-protocol-eth/abi/IdentityFactory"
import ERC20ABI from "./abi/ERC20"
import {
	ADDR_STAKING,
	ADDR_FACTORY,
	ADDR_ADX,
	MAX_UINT,
	ZERO,
	POOLS
} from "./helpers/constants"
import { getBondId } from "./helpers/bonds"
import { getUserIdentity, zeroFeeTx } from "./helpers/identity"
import { getSigner } from "./ethereum"

const ADDR_CORE = "0x333420fc6a897356e69b62417cd17ff012177d2b"
// const ADDR_ADX_OLD = "0x4470bb87d77b963a013db939be332f927f2b992e"

const provider = getDefaultProvider()
const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const Core = new Contract(ADDR_CORE, CoreABI, provider)

const MAX_SLASH = bigNumberify("1000000000000000000")

// 0.2 DAI or ADX
const OUTSTANDING_REWARD_THRESHOLD = bigNumberify("200000000000000000")

export const EMPTY_STATS = {
	loaded: false,
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO,
	rewardChannels: [],
	totalRewardADX: ZERO,
	totalRewardDAI: ZERO,
	userTotalStake: ZERO,
	totalBalanceADX: ZERO
}

const sumRewards = all =>
	all.map(x => x.outstandingReward).reduce((a, b) => a.add(b), ZERO)

export async function loadStats(chosenWalletType) {
	const [totalStake, userStats] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserStats(chosenWalletType)
	])

	return { ...userStats, totalStake }
}

export async function loadUserStats(chosenWalletType) {
	if (!chosenWalletType.name) return { ...EMPTY_STATS, loaded: true }

	const signer = await getSigner(chosenWalletType)
	if (!signer) return { ...EMPTY_STATS, loaded: true }

	const addr = await signer.getAddress()

	const [{ userBonds, userBalance }, rewardChannels] = await Promise.all([
		loadBondStats(addr),
		getRewards(addr)
	])

	const userTotalStake = userBonds
		.filter(x => x.status === "Active")
		.map(x => x.currentAmount)
		.reduce((a, b) => a.add(b), ZERO)

	const totalRewardADX = sumRewards(
		rewardChannels.filter(x => x.channelArgs.tokenAddr === ADDR_ADX)
	)

	const totalRewardDAI = sumRewards(
		rewardChannels.filter(x => x.channelArgs.tokenAddr !== ADDR_ADX)
	)

	const totalBalanceADX = userBalance.add(totalRewardADX).add(userTotalStake)

	return {
		userBonds,
		userBalance, // ADX on wallet
		loaded: true,
		rewardChannels,
		totalRewardADX,
		totalRewardDAI,
		userTotalStake,
		totalBalanceADX // Wallet + Stake + Reward
	}
}

export async function loadBondStats(addr) {
	const identityAddr = getUserIdentity(addr).addr
	const [balances, logs, slashLogs] = await Promise.all([
		Promise.all([Token.balanceOf(addr), Token.balanceOf(identityAddr)]),
		provider.getLogs({
			fromBlock: 0,
			address: ADDR_STAKING,
			topics: [null, hexZeroPad(identityAddr, 32)]
		}),
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogSlash(null, null) })
	])

	const userBalance = balances.reduce((a, b) => a.add(b))

	const slashedByPool = slashLogs.reduce((pools, log) => {
		const { poolId, newSlashPts } = Staking.interface.parseLog(log).values
		pools[poolId] = newSlashPts
		return pools
	}, {})

	const userBonds = logs.reduce((bonds, log) => {
		const topic = log.topics[0]
		const evs = Staking.interface.events
		if (topic === evs.LogBond.topic) {
			const vals = Staking.interface.parseLog(log).values
			const { owner, amount, poolId, nonce, slashedAtStart, time } = vals
			const bond = { owner, amount, poolId, nonce, slashedAtStart, time }
			bonds.push({
				id: getBondId(bond),
				status: "Active",
				currentAmount: bond.amount
					.mul(MAX_SLASH.sub(slashedByPool[poolId] || ZERO))
					.div(MAX_SLASH.sub(slashedAtStart)),
				...bond
			})
		} else if (topic === evs.LogUnbondRequested.topic) {
			// NOTE: assuming that .find() will return something is safe, as long as the logs are properly ordered
			const { bondId, willUnlock } = Staking.interface.parseLog(log).values
			const bond = bonds.find(({ id }) => id === bondId)
			bond.status = "UnbondRequested"
			bond.willUnlock = new Date(willUnlock * 1000)
		} else if (topic === evs.LogUnbonded.topic) {
			const { bondId } = Staking.interface.parseLog(log).values
			bonds.find(({ id }) => id === bondId).status = "Unbonded"
		}
		return bonds
	}, [])

	return { userBonds, userBalance }
}

export async function getRewards(addr) {
	const identityAddr = getUserIdentity(addr).addr
	const rewardPool = POOLS[0]
	const resp = await fetch(`${rewardPool.url}/fee-rewards`)
	const rewardChannels = await resp.json()
	const validUntil = Math.floor(Date.now() / 1000)
	const forUser = await Promise.all(
		rewardChannels.map(async rewardChannel => {
			if (rewardChannel.channelArgs.validUntil < validUntil) return null
			const claimFrom = rewardChannel.balances[addr] ? addr : identityAddr
			if (!rewardChannel.balances[claimFrom]) return null
			const balanceTree = new BalanceTree(rewardChannel.balances)
			const outstandingReward = bigNumberify(
				rewardChannel.balances[claimFrom]
			).sub(await Core.withdrawnPerUser(rewardChannel.channelId, claimFrom))
			if (outstandingReward.lt(OUTSTANDING_REWARD_THRESHOLD)) return null
			return {
				...rewardChannel,
				outstandingReward,
				claimFrom,
				proof: balanceTree.getProof(claimFrom),
				stateRoot: balanceTree.mTree.getRoot(),
				amount: rewardChannel.balances[claimFrom]
			}
		})
	)
	return forUser.filter(x => x)
}

export async function createNewBond(
	stats,
	chosenWalletType,
	{ amount, poolId, nonce }
) {
	if (!poolId) return
	if (!stats.userBalance) return
	if (amount.gt(stats.userBalance)) throw new Error("amount too large")

	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("failed to get signer")

	const walletAddr = await signer.getAddress()
	const { addr } = getUserIdentity(walletAddr)

	const bond = [
		amount,
		poolId,
		nonce || bigNumberify(Math.floor(Date.now() / 1000))
	]

	const [allowance, allowanceStaking, balanceOnIdentity] = await Promise.all([
		Token.allowance(walletAddr, addr),
		Token.allowance(addr, Staking.address),
		Token.balanceOf(addr)
	])

	// Eg bond amount is 10 but we only have 60, we need another 40
	const needed = amount.sub(balanceOnIdentity)
	const setAllowance = needed.gt(ZERO) && !allowance.gte(amount)
	if (setAllowance) {
		const tokenWithSigner = new Contract(ADDR_ADX, ERC20ABI, signer)
		await tokenWithSigner.approve(addr, MAX_UINT)
	}

	let identityTxns = []
	if (needed.gt(ZERO))
		identityTxns.push([
			Token.address,
			Token.interface.functions.transferFrom.encode([walletAddr, addr, amount])
		])
	if (allowanceStaking.lt(amount))
		identityTxns.push([
			Token.address,
			Token.interface.functions.approve.encode([Staking.address, MAX_UINT])
		])

	const active = stats.userBonds.find(
		x => x.status === "Active" && x.poolId === poolId
	)
	const stakingData = active
		? Staking.interface.functions.replaceBond.encode([
				active,
				[active.amount.add(amount), poolId, active.nonce]
		  ])
		: Staking.interface.functions.addBond.encode([bond])
	identityTxns.push([Staking.address, stakingData])

	await executeOnIdentity(
		chosenWalletType,
		identityTxns,
		setAllowance ? { gasLimit: 450000 } : {}
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
		if (!signer) throw new Error("failed to get signer")
		const walletAddr = await signer.getAddress()
		await executeOnIdentity(chosenWalletType, [
			[Staking.address, Staking.interface.functions.unbond.encode([bond])],
			[
				Token.address,
				Token.interface.functions.transfer.encode([walletAddr, amount])
			]
		])
	} else {
		await executeOnIdentity(chosenWalletType, [
			[
				Staking.address,
				Staking.interface.functions.requestUnbond.encode([bond])
			]
		])
	}
}

export async function claimRewards(chosenWalletType, rewardChannels) {
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("failed to get signer")
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
				Core.interface.functions.channelWithdraw.encode([
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
				Token.interface.functions.transfer.encode([walletAddr, amount])
			])
		)

	if (identityTxns.length) {
		await executeOnIdentity(chosenWalletType, identityTxns)
	}
}

export async function restake(chosenWalletType, { rewardChannels, userBonds }) {
	const channels = rewardChannels.filter(
		x => x.channelArgs.tokenAddr === ADDR_ADX
	)
	if (!channels.length) throw new Error("no channels to earn from")

	// @TODO how does the user determine the pool here? For now there's only one, but after?
	const collected = channels
		.map(x => x.outstandingReward)
		.reduce((a, b) => a.add(b))
	const userBond =
		userBonds.find(x => x.status === "Active") ||
		userBonds.find(x => x.status === "UnbondRequested")
	if (!userBond) throw new Error("You have no active bonds")
	const { amount, poolId, nonce } = userBond
	const bond = [amount, poolId, nonce]
	const newBond = [amount.add(collected), poolId, nonce]

	const identityTxns = channels
		.map(rewardChannel => {
			const channelTuple = toChannelTuple(rewardChannel.channelArgs)
			return [
				Core.address,
				Core.interface.functions.channelWithdraw.encode([
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
				Token.interface.functions.approve.encode([Staking.address, newBond[0]])
			],
			[
				Staking.address,
				Staking.interface.functions.replaceBond.encode([bond, newBond])
			]
		])

	await executeOnIdentity(chosenWalletType, identityTxns)
}

function toChannelTuple(args) {
	return [
		args.creator,
		args.tokenAddr,
		args.tokenAmount,
		args.validUntil,
		args.validators,
		args.spec
	]
}

export async function executeOnIdentity(chosenWalletType, txns, opts = {}) {
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("failed to get signer")
	const walletAddr = await signer.getAddress()
	const { addr, bytecode } = getUserIdentity(walletAddr)
	const identity = new Contract(addr, IdentityABI, signer)

	const needsToDeploy = (await provider.getCode(identity.address)) === "0x"
	const idNonce = needsToDeploy ? ZERO : await identity.nonce()
	const toTuples = offset => ([to, data], i) =>
		zeroFeeTx(
			identity.address,
			idNonce.add(i + offset),
			to,
			data
		).toSolidityTuple()
	if (!needsToDeploy) {
		const txnTuples = txns.map(toTuples(0))
		await identity.executeBySender(txnTuples, opts)
	} else {
		const factoryWithSigner = new Contract(ADDR_FACTORY, FactoryABI, signer)
		// Has offset because the execute() takes the first nonce
		const txnTuples = txns.map(toTuples(1))
		const executeTx = zeroFeeTx(
			identity.address,
			idNonce,
			identity.address,
			identity.interface.functions.executeBySender.encode([txnTuples])
		)
		const sig = await signer.signMessage(executeTx.hash())
		await factoryWithSigner.deployAndExecute(
			bytecode,
			0,
			[executeTx.toSolidityTuple()],
			[splitSig(sig)],
			opts
		)
	}
}
