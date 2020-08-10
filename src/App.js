import React, { useEffect, useState } from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { themeMUI } from "./themeMUi"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Modal from "@material-ui/core/Modal"
import Backdrop from "@material-ui/core/Backdrop"
import Fab from "@material-ui/core/Fab"
import AddIcon from "@material-ui/icons/Add"
import Fade from "@material-ui/core/Fade"
import Snackbar from "@material-ui/core/Snackbar"
import MuiAlert from "@material-ui/lab/Alert"
import HelperMenu from "./components/HelperMenu"
import logo from "./adex-staking.svg"
import { Contract, getDefaultProvider } from "ethers"
import { bigNumberify, hexZeroPad, Interface } from "ethers/utils"
import { Web3Provider } from "ethers/providers"
import BalanceTree from "adex-protocol-eth/js/BalanceTree"
import StakingABI from "adex-protocol-eth/abi/Staking"
import IdentityABI from "adex-protocol-eth/abi/Identity"
import CoreABI from "adex-protocol-eth/abi/AdExCore"
import IdentityFactoryABI from "adex-protocol-eth/abi/IdentityFactory"
import ERC20ABI from "./abi/ERC20"
import Dashboard from "./components/Dashboard"
import NewBondForm from "./components/NewBondForm"
import UnbondConfirmationDialog from "./components/UnbondConfirmationDialog"
import {
	ADDR_STAKING,
	ADDR_FACTORY,
	ADDR_ADX,
	MAX_UINT,
	ZERO,
	POOLS,
	TOKEN_OLD_TO_NEW_MULTIPLIER
} from "./helpers/constants"
import { getBondId } from "./helpers/utils"
import { getUserIdentity, zeroFeeTx } from "./helpers/identity"

const ADDR_CORE = "0x333420fc6a897356e69b62417cd17ff012177d2b"
const ADDR_ADX_OLD = "0x4470bb87d77b963a013db939be332f927f2b992e"
const REFRESH_INTVL = 20000

const provider = getDefaultProvider()
const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const OldToken = new Contract(ADDR_ADX_OLD, ERC20ABI, provider)
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const Core = new Contract(ADDR_CORE, CoreABI, provider)

const MAX_SLASH = bigNumberify("1000000000000000000")

const EMPTY_STATS = {
	loaded: false,
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO
}

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />
}

export default function App() {
	const [isNewBondOpen, setNewBondOpen] = useState(false)
	const [toUnbond, setToUnbond] = React.useState(null)
	const [openErr, setOpenErr] = useState(false)
	const [snackbarErr, setSnackbarErr] = useState(
		"Error! Unspecified error occured."
	)
	const [stats, setStats] = useState(EMPTY_STATS)

	const refreshStats = () =>
		loadStats()
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
	}, [])

	const wrapError = fn => async (...args) => {
		try {
			await fn.apply(null, args)
		} catch (e) {
			console.error(e)
			setOpenErr(true)
			setSnackbarErr(e.message || "Unknown error")
		}
	}
	const onRequestUnbond = wrapError(onUnbondOrRequest.bind(null, false))
	const onUnbond = wrapError(onUnbondOrRequest.bind(null, true))
	const handleClose = (event, reason) => {
		if (reason === "clickaway") {
			return
		}
		setOpenErr(false)
	}
	const onClaimRewards = wrapError(claimRewards)

	return (
		<MuiThemeProvider theme={themeMUI}>
			<AppBar position="static">
				<Toolbar>
					<img height="40vh" src={logo} alt="logo"></img>
					<Fab
						disabled={!stats.loaded}
						onClick={() => setNewBondOpen(true)}
						variant="extended"
						color="secondary"
						style={{ position: "absolute", right: "5%", top: "50%" }}
					>
						<AddIcon style={{ margin: themeMUI.spacing(1) }} />
						{"Stake your ADX"}
					</Fab>
					{HelperMenu()}
				</Toolbar>
			</AppBar>

			{Dashboard({
				stats,
				onRequestUnbond: setToUnbond,
				onUnbond,
				onClaimRewards
			})}

			{UnbondConfirmationDialog({
				toUnbond,
				onDeny: () => setToUnbond(null),
				onConfirm: () => {
					if (toUnbond) onRequestUnbond(toUnbond)
					setToUnbond(null)
				}
			})}
			<Snackbar open={openErr} autoHideDuration={6000} onClose={handleClose}>
				<Alert onClose={handleClose} severity="error">
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
						maxAmount: stats.userBalance.div(TOKEN_OLD_TO_NEW_MULTIPLIER),
						onNewBond: async bond => {
							setNewBondOpen(false)
							await wrapError(createNewBond.bind(null, stats, bond))()
						}
					})}
				</Fade>
			</Modal>
		</MuiThemeProvider>
	)
}

async function getSigner() {
	if (typeof window.ethereum !== "undefined") {
		await window.ethereum.enable()
	}

	if (!window.web3) return null

	const provider = new Web3Provider(window.web3.currentProvider)
	const signer = provider.getSigner()
	return signer
}

async function loadStats() {
	const [totalStake, userStats] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserStats()
	])

	return { totalStake, ...userStats }
}

async function loadUserStats() {
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
		Promise.all([
			OldToken.balanceOf(addr).then(x => x.mul(TOKEN_OLD_TO_NEW_MULTIPLIER)),
			// @TODO: those are disabled cause of the assumption in createNewBond
			// re-enable them
			//Token.balanceOf(addr),
			OldToken.balanceOf(identityAddr).then(x =>
				x.mul(TOKEN_OLD_TO_NEW_MULTIPLIER)
			)
			//Token.balanceOf(identityAddr)
		]),
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
			if (outstandingReward.eq(ZERO)) return null
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
	// @TODO: TEMP: amount here will be in the old token amount
	if (amount.gt(stats.userBalance.div(TOKEN_OLD_TO_NEW_MULTIPLIER)))
		throw new Error("amount too large")

	const signer = await getSigner()
	if (!signer) throw new Error("failed to get signer")

	const walletAddr = await signer.getAddress()
	const { addr, bytecode } = getUserIdentity(walletAddr)

	// @TODO: TEMP: amount here will be in the old token amount
	const bond = [
		amount.mul(TOKEN_OLD_TO_NEW_MULTIPLIER),
		poolId,
		nonce || bigNumberify(Math.floor(Date.now() / 1000))
	]

	const identity = new Contract(addr, IdentityABI, signer)
	const tokenWithSigner = new Contract(ADDR_ADX_OLD, ERC20ABI, signer)
	const factoryWithSigner = new Contract(
		ADDR_FACTORY,
		IdentityFactoryABI,
		signer
	)

	let txns = []
	const balanceOnIdentity = await OldToken.balanceOf(identity.address)
	// Eg bond amount is 10 but we only have 6, we need another 4
	const needed = amount.sub(balanceOnIdentity)
	if ((await provider.getCode(identity.address)) !== "0x") {
		console.log("Contract exists: " + identity.address)
		let identityTxns = []
		const [idNonce, allowance] = await Promise.all([
			identity.nonce(),
			tokenWithSigner.allowance(walletAddr, identity.address)
		])
		if (!allowance.gt(amount)) {
			if (allowance.gt(ZERO)) {
				txns.push(
					await tokenWithSigner.approve(identity.address, ZERO, {
						gasLimit: 80000
					})
				)
			}
			txns.push(
				await tokenWithSigner.approve(identity.address, MAX_UINT, {
					gasLimit: 80000
				})
			)
		}
		if (needed.gt(ZERO))
			identityTxns.push(
				zeroFeeTx(
					identity.address,
					idNonce,
					OldToken.address,
					OldToken.interface.functions.transferFrom.encode([
						walletAddr,
						identity.address,
						amount
					])
				)
			)
		identityTxns.push(
			zeroFeeTx(
				identity.address,
				idNonce.add(identityTxns.length),
				OldToken.address,
				OldToken.interface.functions.approve.encode([Token.address, amount])
			)
		)
		const ADXToken = new Interface([
			"function swap(uint prevTokenAmount) external"
		])
		identityTxns.push(
			zeroFeeTx(
				identity.address,
				idNonce.add(identityTxns.length),
				Token.address,
				ADXToken.functions.swap.encode([amount])
			)
		)
		identityTxns.push(
			zeroFeeTx(
				identity.address,
				idNonce.add(identityTxns.length),
				Token.address,
				Token.interface.functions.approve.encode([Staking.address, bond[0]])
			)
		)
		identityTxns.push(
			zeroFeeTx(
				identity.address,
				idNonce.add(identityTxns.length),
				Staking.address,
				Staking.interface.functions.addBond.encode([bond])
			)
		)
		txns.push(
			await identity.executeBySender(
				identityTxns.map(x => x.toSolidityTuple()),
				{ gasLimit: 310000 }
			)
		)
	} else {
		console.log("Contract does not exist: " + identity.address)
		if (needed.gt(ZERO))
			txns.push(
				await tokenWithSigner.transfer(identity.address, needed, {
					gasLimit: 80000
				})
			)
		// Contract will open the bond on deploy
		// technically it needs around 450000
		txns.push(await factoryWithSigner.deploy(bytecode, 0, { gasLimit: 450000 }))
	}

	await Promise.all(txns.map(tx => tx.wait()))
}

async function onUnbondOrRequest(isUnbond, { amount, poolId, nonce }) {
	const signer = await getSigner()
	if (!signer) throw new Error("failed to get signer")
	const walletAddr = await signer.getAddress()
	const { addr, bytecode } = getUserIdentity(walletAddr)
	const identity = new Contract(addr, IdentityABI, signer)
	// @TODO handle when the contract is not deployed
	// Contract will open the bond on deploy
	// technically it needs around 450000
	let idNonce
	let gasLimit
	if ((await provider.getCode(identity.address)) !== "0x") {
		idNonce = await identity.nonce()
	} else {
		idNonce = ZERO
		const factoryWithSigner = new Contract(
			ADDR_FACTORY,
			IdentityFactoryABI,
			signer
		)
		await factoryWithSigner.deploy(bytecode, 0, { gasLimit: 400000 })
		gasLimit = isUnbond ? 140000 : 70000
	}
	const bond = [amount, poolId, nonce || ZERO]
	const txns = []
	if (isUnbond) {
		txns.push(
			zeroFeeTx(
				identity.address,
				idNonce,
				Staking.address,
				Staking.interface.functions.unbond.encode([bond])
			)
		)
		txns.push(
			zeroFeeTx(
				identity.address,
				idNonce.add(1),
				Token.address,
				Token.interface.functions.transfer.encode([walletAddr, amount])
			)
		)
	} else {
		txns.push(
			zeroFeeTx(
				identity.address,
				idNonce,
				Staking.address,
				Staking.interface.functions.requestUnbond.encode([bond])
			)
		)
	}
	const tx = await identity.executeBySender(
		txns.map(x => x.toSolidityTuple()),
		{ gasLimit }
	)
	await tx.wait()
}

// @TODO reimplement
async function claimRewards(rewardChannels) {
	const signer = await getSigner()
	if (!signer) throw new Error("failed to get signer")
	const coreWithSigner = new Contract(ADDR_CORE, CoreABI, signer)
	let txns = []
	for (const rewardChannel of rewardChannels) {
		const args = rewardChannel.channelArgs
		const channelTuple = [
			args.creator,
			args.tokenAddr,
			args.tokenAmount,
			args.validUntil,
			args.validators,
			args.spec
		]
		txns.push(
			await coreWithSigner.channelWithdraw(
				channelTuple,
				rewardChannel.stateRoot,
				rewardChannel.signatures,
				rewardChannel.proof,
				rewardChannel.amount
			)
		)
	}
	return Promise.all(txns.map(tx => tx.wait()))
}
