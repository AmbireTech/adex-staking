import React, { useEffect, useState } from "react"
import { Switch, Route } from "react-router-dom"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { themeMUI } from "./themeMUi"
import { makeStyles } from "@material-ui/core/styles"
import {
	Drawer,
	Hidden,
	Modal,
	Backdrop,
	Fade,
	Snackbar
} from "@material-ui/core"
import { Alert as MuiAlert } from "@material-ui/lab"
import ChooseWallet from "./components/ChooseWallet"
import { Contract, getDefaultProvider } from "ethers"
import { bigNumberify, hexZeroPad } from "ethers/utils"
import { Web3Provider } from "ethers/providers"
import BalanceTree from "adex-protocol-eth/js/BalanceTree"
import { splitSig } from "adex-protocol-eth/js"
import StakingABI from "adex-protocol-eth/abi/Staking"
import IdentityABI from "adex-protocol-eth/abi/Identity"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import FactoryABI from "adex-protocol-eth/abi/IdentityFactory"
import ERC20ABI from "./abi/ERC20"
import Dashboard from "./components/Dashboard"
import NewBondForm from "./components/NewBondForm"
import LegacyADXSwapDialog from "./components/LegacyADXSwapDialog"
import ConfirmationDialog from "./components/ConfirmationDialog"
import { AppToolbar } from "./components/Toolbar"
import SideNav from "./components/SideNav"
import {
	ADDR_STAKING,
	ADDR_FACTORY,
	ADDR_ADX,
	MAX_UINT,
	ZERO,
	UNBOND_DAYS,
	POOLS,
	WALLET_CONNECT,
	METAMASK
} from "./helpers/constants"
import { formatADXPretty } from "./helpers/formatting"
import { getBondId } from "./helpers/bonds"
import { getUserIdentity, zeroFeeTx } from "./helpers/identity"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { styles } from "./rootStyles"

const ADDR_CORE = "0x333420fc6a897356e69b62417cd17ff012177d2b"
// const ADDR_ADX_OLD = "0x4470bb87d77b963a013db939be332f927f2b992e"
const REFRESH_INTVL = 20000

const provider = getDefaultProvider()
const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const Core = new Contract(ADDR_CORE, CoreABI, provider)

const MAX_SLASH = bigNumberify("1000000000000000000")

// 0.2 DAI or ADX
const OUTSTANDING_REWARD_THRESHOLD = bigNumberify("200000000000000000")

const EMPTY_STATS = {
	loaded: false,
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO
}

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />
}

// set to the available wallet types
let WalletType = null
// chosen signer
let Signer = null
const { REACT_APP_INFURA_ID } = process.env

const useStyles = makeStyles(styles)

export default function Root() {
	const classes = useStyles()
	const [mobileOpen, setMobileOpen] = useState(false)
	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	const [isNewBondOpen, setNewBondOpen] = useState(false)
	const [toUnbond, setToUnbond] = useState(null)
	const [toRestake, setToRestake] = useState(null)
	const [openErr, setOpenErr] = useState(false)
	const [openDoingTx, setOpenDoingTx] = useState(false)
	const [snackbarErr, setSnackbarErr] = useState(
		"Error! Unspecified error occured."
	)
	const [stats, setStats] = useState(EMPTY_STATS)
	const [connectWallet, setConnectWallet] = useState(null)
	const [chosenWalletType, setChosenWalletType] = useState(null)

	const refreshStats = () =>
		loadStats(chosenWalletType)
			.then(setStats)
			.catch(e => {
				console.error("loadStats", e)
				setOpenErr(true)
				if (e.code === 4001) {
					setSnackbarErr("Error! User denied authorization!")
				}
			})

	useEffect(() => {
		refreshStats()
		const intvl = setInterval(refreshStats, REFRESH_INTVL)
		return () => clearInterval(intvl)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType])

	const wrapDoingTxns = fn => async (...args) => {
		try {
			setOpenDoingTx(true)
			setOpenErr(false)
			const res = await fn.apply(null, args)
			setOpenDoingTx(false)
			return res
		} catch (e) {
			console.error(e)
			setOpenDoingTx(false)
			setOpenErr(true)
			setSnackbarErr(e.message || "Unknown error")
		}
	}
	const onRequestUnbond = wrapDoingTxns(onUnbondOrRequest.bind(null, false))
	const onUnbond = wrapDoingTxns(onUnbondOrRequest.bind(null, true))
	const onClaimRewards = wrapDoingTxns(claimRewards)
	const onRestake = wrapDoingTxns(restake.bind(null, stats))
	const handleErrClose = (event, reason) => {
		if (reason === "clickaway") {
			return
		}
		setOpenErr(false)
	}

	const drawer = <SideNav />

	return (
		<MuiThemeProvider theme={themeMUI}>
			<AppToolbar
				chosenWalletType={chosenWalletType}
				setConnectWallet={setConnectWallet}
				setNewBondOpen={setNewBondOpen}
				stats={stats}
				handleDrawerToggle={handleDrawerToggle}
			/>

			<Hidden mdUp>
				<Drawer
					variant="temporary"
					anchor="left"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					classes={{
						paper: classes.drawerPaper
					}}
					ModalProps={{
						keepMounted: true // Better open performance on mobile.
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>
			<Hidden smDown implementation="css">
				<Drawer
					variant="permanent"
					open
					classes={{
						paper: classes.drawerPaper
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>

			<Switch>
				<Route path="/bonds">
					{Dashboard({
						stats,
						onRequestUnbond: setToUnbond,
						onUnbond,
						onClaimRewards,
						onRestake: setToRestake
					})}
				</Route>
				<Route path="/">{"POOLS"}</Route>
			</Switch>

			{// Load stats first to prevent simultanious calls to getSigner
			LegacyADXSwapDialog(
				stats.loaded ? getSigner : null,
				wrapDoingTxns,
				WalletType
			)}

			{ConfirmationDialog({
				isOpen: !!toUnbond,
				onDeny: () => setToUnbond(null),
				onConfirm: () => {
					if (toUnbond) onRequestUnbond(toUnbond)
					setToUnbond(null)
				},
				confirmActionName: "Unbond",
				content: (
					<>
						Are you sure you want to request unbonding of{" "}
						{formatADXPretty(toUnbond ? toUnbond.currentAmount : ZERO)} ADX?
						<br />
						<br />
						Please be aware:
						<ol>
							<li>
								It will take {UNBOND_DAYS} days before you will be able to
								withdraw your ADX!
							</li>
							<li>
								You will not receive staking rewards for this amount in this{" "}
								{UNBOND_DAYS} day period.
							</li>
						</ol>
					</>
				)
			})}

			{ConfirmationDialog({
				isOpen: !!toRestake,
				onDeny: () => setToRestake(null),
				onConfirm: () => {
					if (toRestake) onRestake()
					setToRestake(null)
				},
				confirmActionName: "Re-stake",
				content: (
					<>
						Are you sure you want to stake your earnings of{" "}
						{formatADXPretty(toRestake ? toRestake : ZERO)} ADX?
						<br />
						<br />
						Please be aware that this means that this amount will be locked up
						for at least {UNBOND_DAYS} days.
						<br />
						{!stats.userBonds.find(x => x.status === "Active")
							? "Your bond will be re-activated, meaning that your request to unbond will be cancelled but it will start earning rewards again."
							: ""}
					</>
				)
			})}

			{ChooseWallet({
				open: !!connectWallet,
				content: "",
				handleClose: () => {
					setConnectWallet(null)
				},
				handleListItemClick: async text => {
					const signer = await getSigner(text)
					setConnectWallet(null)
					if (!signer) {
						setOpenErr(true)
						setSnackbarErr("Please select a wallet")
					} else {
						setChosenWalletType(WalletType)
					}
				},
				disableWalletConnect: !REACT_APP_INFURA_ID
			})}

			<Snackbar open={openDoingTx}>
				<Alert severity="info">Please sign all pending MetaMask actions!</Alert>
			</Snackbar>
			<Snackbar
				open={openErr}
				autoHideDuration={10000}
				onClose={handleErrClose}
			>
				<Alert onClose={handleErrClose} severity="error">
					{snackbarErr}
				</Alert>
			</Snackbar>

			<Modal
				open={isNewBondOpen}
				onClose={() => setNewBondOpen(false)}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				}}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 300
				}}
			>
				<Fade in={isNewBondOpen}>
					{NewBondForm({
						pools: POOLS.filter(x => x.selectable),
						totalStake: stats.totalStake,
						maxAmount: stats.userBalance,
						onNewBond: async bond => {
							setNewBondOpen(false)
							await wrapDoingTxns(createNewBond.bind(null, stats, bond))()
						},
						WalletType,
						isEarly: stats.userBonds.find(x => x.nonce.toNumber() < 1597276800)
					})}
				</Fade>
			</Modal>
		</MuiThemeProvider>
	)
}

async function getSigner(walletType) {
	WalletType = walletType || WalletType
	if (!WalletType) return null
	if (Signer) return Signer

	if (WalletType === METAMASK) {
		Signer = await getMetamaskSigner()
	} else if (WalletType === WALLET_CONNECT) {
		Signer = await getWalletConnectSigner()
	}

	return Signer
}

async function getMetamaskSigner() {
	if (typeof window.ethereum !== "undefined") {
		await window.ethereum.enable()
	}

	if (!window.web3) {
		WalletType = null
		return null
	}

	const provider = new Web3Provider(window.web3.currentProvider)
	return provider.getSigner()
}

async function getWalletConnectSigner() {
	const provider = new WalletConnectProvider({
		infuraId: REACT_APP_INFURA_ID, // Required
		pollingInterval: 13000
	})

	try {
		await provider.enable()
	} catch (e) {
		console.log("user closed WalletConnect modal")
		WalletType = null
		return null
	}

	const web3 = new Web3Provider(provider)
	return web3.getSigner()
}

async function loadStats(chosenWalletType) {
	const [totalStake, userStats] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserStats(chosenWalletType)
	])

	return { totalStake, ...userStats }
}

async function loadUserStats(chosenWalletType) {
	if (!chosenWalletType)
		return {
			loaded: true,
			userBonds: [],
			userBalance: ZERO,
			rewardChannels: []
		}

	const signer = await getSigner()
	if (!signer)
		return {
			loaded: true,
			userBonds: [],
			userBalance: ZERO,
			rewardChannels: []
		}
	const addr = await signer.getAddress()

	const [bondStats, rewardChannels] = await Promise.all([
		loadBondStats(addr),
		getRewards(addr)
	])
	return { ...bondStats, loaded: true, rewardChannels }
}

async function loadBondStats(addr) {
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

async function getRewards(addr) {
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

async function createNewBond(stats, { amount, poolId, nonce }) {
	if (!poolId) return
	if (!stats.userBalance) return
	if (amount.gt(stats.userBalance)) throw new Error("amount too large")

	const signer = await getSigner()
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
		identityTxns,
		setAllowance ? { gasLimit: 450000 } : {}
	)
}

async function onUnbondOrRequest(isUnbond, { amount, poolId, nonce }) {
	const bond = [amount, poolId, nonce || ZERO]
	if (isUnbond) {
		const signer = await getSigner()
		if (!signer) throw new Error("failed to get signer")
		const walletAddr = await signer.getAddress()
		await executeOnIdentity([
			[Staking.address, Staking.interface.functions.unbond.encode([bond])],
			[
				Token.address,
				Token.interface.functions.transfer.encode([walletAddr, amount])
			]
		])
	} else {
		await executeOnIdentity([
			[
				Staking.address,
				Staking.interface.functions.requestUnbond.encode([bond])
			]
		])
	}
}

async function claimRewards(rewardChannels) {
	const signer = await getSigner()
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
		await executeOnIdentity(identityTxns)
	}
}

async function restake({ rewardChannels, userBonds }) {
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

	await executeOnIdentity(identityTxns)
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

async function executeOnIdentity(txns, opts = {}) {
	const signer = await getSigner()
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
