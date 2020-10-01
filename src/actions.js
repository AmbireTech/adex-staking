import { Contract } from "ethers"
import { bigNumberify, hexZeroPad, id } from "ethers/utils"
import BalanceTree from "adex-protocol-eth/js/BalanceTree"
import { splitSig, Transaction } from "adex-protocol-eth/js"
import StakingABI from "adex-protocol-eth/abi/Staking"
import IdentityABI from "adex-protocol-eth/abi/Identity"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import FactoryABI from "adex-protocol-eth/abi/IdentityFactory"
import ERC20ABI from "./abi/ERC20"
import {
	ADDR_STAKING,
	ADDR_FACTORY,
	ADDR_ADX,
	ADDR_ADX_LOYALTY_TOKEN,
	MAX_UINT,
	ZERO,
	POOLS
} from "./helpers/constants"
import { getBondId } from "./helpers/bonds"
import { getUserIdentity, zeroFeeTx, rawZeroFeeTx } from "./helpers/identity"
import { ADEX_RELAYER_HOST } from "./helpers/constants"
import { getSigner, defaultProvider } from "./ethereum"

const ADDR_CORE = "0x333420fc6a897356e69b62417cd17ff012177d2b"
// const ADDR_ADX_OLD = "0x4470bb87d77b963a013db939be332f927f2b992e"

const provider = defaultProvider
const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const Core = new Contract(ADDR_CORE, CoreABI, provider)
const LoyaltyToken = new Contract(ADDR_ADX_LOYALTY_TOKEN, ERC20ABI, provider)

const MAX_SLASH = bigNumberify("1000000000000000000")

// 0.2 DAI or ADX
const OUTSTANDING_REWARD_THRESHOLD = bigNumberify("200000000000000000")

export const EMPTY_STATS = {
	loaded: false,
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO,
	totalStakeTom: ZERO,
	rewardChannels: [],
	totalRewardADX: ZERO,
	totalRewardDAI: ZERO,
	tomRewardADX: ZERO,
	userTotalStake: ZERO,
	totalBalanceADX: ZERO,
	userWalletBalance: ZERO,
	userIdentityBalance: ZERO,
	canExecuteGasless: false,
	canExecuteGaslessError: null
}

const sumRewards = all =>
	all.map(x => x.outstandingReward).reduce((a, b) => a.add(b), ZERO)

export const isTomChannelId = channel =>
	channel.channelArgs.validators.some(
		val => id(`validator:${val}`) === POOLS[0].id
	)

export async function loadStats(chosenWalletType) {
	const [totalStake, userStats] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserStats(chosenWalletType)
	])

	return { ...userStats, totalStake, totalStakeTom: totalStake }
}

export async function loadUserStats(chosenWalletType) {
	loadDepositsStats()
	if (!chosenWalletType.name) return { ...EMPTY_STATS, loaded: true }

	const signer = await getSigner(chosenWalletType)
	if (!signer) return { ...EMPTY_STATS, loaded: true }

	const addr = await signer.getAddress()
	const identityAddr = getUserIdentity(addr).addr

	const [
		{ userBonds, userBalance, userWalletBalance, userIdentityBalance },
		rewardChannels,
		{ canExecuteGasless, canExecuteGaslessError }
	] = await Promise.all([
		loadBondStats(addr, identityAddr),
		getRewards(addr),
		getGaslessInfo(addr)
	])

	const userTotalStake = userBonds
		.filter(x => x.status === "Active")
		.map(x => x.currentAmount)
		.reduce((a, b) => a.add(b), ZERO)

	const adxRewardsChannels = rewardChannels.filter(
		x => x.channelArgs.tokenAddr === ADDR_ADX
	)
	const tomAdxRewards = [...adxRewardsChannels].filter(x => isTomChannelId(x))

	const totalRewardADX = sumRewards(adxRewardsChannels)
	const tomRewardADX = sumRewards(tomAdxRewards)

	const totalRewardDAI = sumRewards(
		rewardChannels.filter(x => x.channelArgs.tokenAddr !== ADDR_ADX)
	)

	const totalBalanceADX = userBalance.add(totalRewardADX).add(userTotalStake)

	return {
		identityAddr,
		connectedWalletAddress: addr,
		userBonds,
		userBalance, // ADX on wallet
		loaded: true,
		rewardChannels,
		totalRewardADX,
		totalRewardDAI,
		tomRewardADX,
		userTotalStake,
		totalBalanceADX, // Wallet + Stake + Reward
		userWalletBalance,
		userIdentityBalance,
		canExecuteGasless,
		canExecuteGaslessError
	}
}

export async function loadBondStats(addr, identityAddr) {
	const [
		[userWalletBalance, userIdentityBalance],
		logs,
		slashLogs
	] = await Promise.all([
		Promise.all([Token.balanceOf(addr), Token.balanceOf(identityAddr)]),
		provider.getLogs({
			fromBlock: 0,
			address: ADDR_STAKING,
			topics: [null, hexZeroPad(identityAddr, 32)]
		}),
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogSlash(null, null) })
	])

	const userBalance = userWalletBalance.add(userIdentityBalance)

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

	return {
		userBonds,
		userBalance,
		userWalletBalance,
		userIdentityBalance
	}
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

export async function getGaslessInfo(addr) {
	try {
		const res = await fetch(`${ADEX_RELAYER_HOST}/staking/${addr}/can-execute`)
		const resData = await res.json()

		return {
			canExecuteGasless: resData.canExecute === true,
			canExecuteGaslessError: resData.message || null
		}
	} catch (err) {
		console.error(err)
		return {
			canExecuteGasless: false,
			canExecuteGaslessError: "Gasless staking temporary unavailable"
		}
	}
}

export async function loadDepositsStats(walletAddr) {
	const zer0Addr = "0x0000000000000000000000000000000000000000"
	walletAddr = "0xd6e371526cdaee04cd8af225d42e37bc14688d9e"
	const [
		totalADX,
		balanceLpToken,
		totalSupplyLPT,
		loyaltyTokenTransfersLogs,
		adexTokenTransfersLogs
	] = await Promise.all([
		Token.balanceOf(ADDR_ADX_LOYALTY_TOKEN),
		LoyaltyToken.totalSupply(),
		LoyaltyToken.balanceOf(walletAddr),
		provider.getLogs({
			fromBlock: 0,
			...LoyaltyToken.filters.Transfer(null, walletAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(walletAddr, ADDR_ADX_LOYALTY_TOKEN, null)
		})
	])

	const balanceLpADX = balanceLpToken.mul(totalADX).div(totalSupplyLPT)

	const currentBalance = {
		balanceLpToken,
		balanceLpADX
	}

	const hasExternalLoyaltyTokenTransfers = loyaltyTokenTransfersLogs.some(
		log => LoyaltyToken.interface.parseLog(log).values[0] !== zer0Addr
	)

	// rewards === null => unknown rewards - can not be calculated
	if (hasExternalLoyaltyTokenTransfers) {
		currentBalance.rewards = null
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

				deposits.adx = deposits.adx.add(lpTokenLog.values[2])
				deposits.adxLPT = deposits.adxLPT.add(adxTransferLog.values[2])
			}

			return deposits
		},
		{ adx: ZERO, adxLPT: ZERO }
	)

	const avgDepositPrice = userDeposits.adxLPT.div(userDeposits.adx)

	const depositedADX = balanceLpADX.div(avgDepositPrice)

	const reward = balanceLpADX - depositedADX

	currentBalance.reward = reward

	return currentBalance
}

export async function createNewBond(
	stats,
	chosenWalletType,
	{ amount, poolId, nonce },
	gasless
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

	// Edge case: if we're gasless, the ADX is already on the identity and it's not deployed (constructor will be executed)
	if (
		gasless &&
		amount.eq(balanceOnIdentity) &&
		(await provider.getCode(addr)) === "0x"
	) {
		return executeOnIdentity(chosenWalletType, [], {}, true)
	}
	// @TODO consider handling this edge case in non-gasless cases when there's some ADX on the identity
	// or at least `if (needsDeploying && balanceOnIdentity.gt(ZERO)) throw` cause otherwise the tx would just fail
	// because the cnstructor will bond this amount first

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

	return executeOnIdentity(chosenWalletType, identityTxns, {}, gasless)
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

export async function executeOnIdentity(
	chosenWalletType,
	txns,
	opts = {},
	gasless
) {
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
	if (gasless) {
		// @TODO: we can use execute that calls into executeBySender here to only sign one tx
		const txnsRaw = txns.map(([to, data], i) =>
			rawZeroFeeTx(identity.address, idNonce.add(i), to, data)
		)
		const signatures = []
		for (const tx of txnsRaw) {
			const sig = await signer.signMessage(new Transaction(tx).hash())
			signatures.push(splitSig(sig))
		}

		const executeUrl = `${ADEX_RELAYER_HOST}/staking/${walletAddr}/execute`
		const res = await fetch(executeUrl, {
			method: "POST",
			body: JSON.stringify({
				txnsRaw,
				signatures
			}),
			headers: { "Content-Type": "application/json" }
		})
		if (res.status === 500) throw new Error("Relayer: internal error")
		return res.json()
	} else if (!needsToDeploy) {
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
