import React, { useEffect, useState } from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { themeMUI } from "./themeMUi"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import TextField from "@material-ui/core/TextField"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import Modal from "@material-ui/core/Modal"
import Backdrop from "@material-ui/core/Backdrop"
import Fab from "@material-ui/core/Fab"
import AddIcon from "@material-ui/icons/Add"
import Fade from "@material-ui/core/Fade"
import Paper from "@material-ui/core/Paper"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"
import logo from "./adex-staking.svg"
import { Contract, getDefaultProvider } from "ethers"
import {
	bigNumberify,
	id,
	hexZeroPad,
	keccak256,
	defaultAbiCoder
} from "ethers/utils"
import { Web3Provider } from "ethers/providers"
import { StakingABI } from "./abi/Staking"
import { ERC20ABI } from "./abi/ERC20"

const ADDR_ADX = "0x4470bb87d77b963a013db939be332f927f2b992e"
const ADDR_STAKING = "0x4b06542aa382cd8f9863f1281e70a87ce1197930"
const ADX_MULTIPLIER = 10000
const REFRESH_INTVL = 30000

const provider = getDefaultProvider()
const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)

const PRICES_API_URL =
	"https://min-api.cryptocompare.com/data/price?fsym=ADX&tsyms=BTC,USD,EUR"

const POOLS = [
	{
		label: "Validator Tom",
		id: id("validator:0x2892f6C41E0718eeeDd49D98D648C789668cA67d")
	},
	{
		label: "Validator Jerry",
		id: id("validator:0xce07CbB7e054514D590a0262C93070D838bFBA2e")
	}
]

const ZERO = bigNumberify(0)
const DEFAULT_BOND = {
	poolId: "",
	amount: ZERO
}
const EMPTY_STATS = {
	loaded: false,
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO
}

function StatsCard({ title, subtitle, extra, loaded }) {
	return (
		<Card style={{ margin: themeMUI.spacing(1) }}>
			<CardContent>
				<Typography variant="h5">{subtitle}</Typography>
				{extra ? (
					<Typography color="primary" variant="h6">
						{extra}
					</Typography>
				) : (
					<></>
				)}
				<Typography color="textSecondary" variant="subtitle2">
					{title}
				</Typography>
			</CardContent>
			{!loaded ? <LinearProgress /> : <></>}
		</Card>
	)
}

function NewBondForm({ maxAmount, onNewBond, pools }) {
	// @TODO: should the button be in a FormControl?
	const [bond, setBond] = useState(DEFAULT_BOND)
	return (
		<Paper elevation={2} style={{ padding: themeMUI.spacing(2, 4, 3) }}>
			<h2>Create a bond</h2>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<TextField
						required
						label="ADX amount"
						type="number"
						onChange={ev =>
							setBond({
								...bond,
								amount: bigNumberify(ev.target.value * ADX_MULTIPLIER)
							})
						}
					></TextField>
					<Typography variant="subtitle2">
						Max amount: {formatADX(maxAmount)} ADX
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<FormControl required>
						<InputLabel>Pool</InputLabel>
						<Select
							style={{ minWidth: "180px" }}
							value={bond.poolId}
							onChange={ev => setBond({ ...bond, poolId: ev.target.value })}
						>
							<MenuItem value={""}>
								<em>None</em>
							</MenuItem>
							{pools.map(({ label, id }) => (
								<MenuItem key={id} value={id}>
									{label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12}>
					<FormControl>
						<Button
							color="primary"
							variant="contained"
							onClick={() => onNewBond(bond)}
						>
							Stake ADX
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Paper>
	)
}

function UnbondConfirmationDialog({ toUnbond, onDeny, onConfirm }) {
	return (
		<Dialog
			open={!!toUnbond}
			onClose={onDeny}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>
			<DialogContent>
				Are you sure you want to request unbonding of{" "}
				{formatADX(toUnbond ? toUnbond.amount : ZERO)} ADX?
				<br />
				<br />
				Please be aware:
				<ol>
					<li>
						It will take 30 days before you will be able to withdraw your ADX!
					</li>
					<li>
						You will not receive staking rewards for this amount in this period.
					</li>
				</ol>
			</DialogContent>
			<DialogActions>
				<Button onClick={onDeny} autoFocus color="primary">
					Cancel
				</Button>
				<Button onClick={onConfirm} color="primary">
					Unbond
				</Button>
			</DialogActions>
		</Dialog>
	)
}

function Dashboard({ stats, onRequestUnbond }) {
	const userTotalStake = stats.userBonds
		.filter(x => x.status === "Active")
		.map(x => x.amount)
		.reduce((a, b) => a.add(b), ZERO)

	// USD values
	const [prices, setPrices] = useState({})
	const refreshPrices = () =>
		fetch(PRICES_API_URL)
			.then(r => r.json())
			.then(setPrices)
			.catch(console.error)
	useEffect(() => {
		refreshPrices()
	}, [])
	const inUSD = adxAmount => {
		if (!adxAmount) return null
		if (!prices.USD) return null
		const usdAmount = (adxAmount.toNumber(10) / ADX_MULTIPLIER) * prices.USD
		return `${usdAmount.toFixed(2)} USD`
	}

	const renderBondRow = bond => {
		const pool = POOLS.find(x => x.id === bond.poolId)
		const poolLabel = pool ? pool.label : bond.poolId
		return (
			<TableRow key={getBondId(bond)}>
				<TableCell>{formatADX(bond.amount)} ADX</TableCell>
				<TableCell align="right">0.00 DAI</TableCell>
				<TableCell align="right">{poolLabel}</TableCell>
				<TableCell align="right">{bond.status}</TableCell>
				<TableCell align="right">
					{bond.status === "Active" ? (
						<Button color="primary" onClick={() => onRequestUnbond(bond)}>
							Unbond
						</Button>
					) : (
						<Button disabled color="secondary">
							Withdraw
						</Button>
					)}
				</TableCell>
			</TableRow>
		)
	}

	return (
		<Grid container style={{ padding: themeMUI.spacing(4) }}>
			<Grid item xs={3}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Total ADX staked",
					extra: inUSD(stats.totalStake),
					subtitle: formatADX(stats.totalStake) + " ADX"
				})}
			</Grid>

			<Grid item xs={3}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Your total active stake",
					extra: inUSD(userTotalStake),
					subtitle: formatADX(userTotalStake) + " ADX"
				})}
			</Grid>

			<Grid item xs={3}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Your balance",
					subtitle: stats.userBalance
						? formatADX(stats.userBalance) + " ADX"
						: "",
					extra: inUSD(stats.userBalance)
				})}
			</Grid>

			<Grid item xs={3}>
				{StatsCard({
					loaded: stats.loaded,
					// @TODO
					title: "Your total reward",
					extra: "0.00 USD",
					subtitle: "0.00 DAI"
				})}
			</Grid>

			{/*<Grid item xs={12}>
			// TODO information about "reward are not launched yet blabla"
			</Grid>*/}

			<TableContainer xs={12}>
				<Table aria-label="Bonds table">
					<TableHead>
						<TableRow>
							<TableCell>Bond amount</TableCell>
							<TableCell align="right">Reward to collect</TableCell>
							<TableCell align="right">Pool</TableCell>
							<TableCell align="right">Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{(stats.userBonds || []).map(renderBondRow)}</TableBody>
				</Table>
			</TableContainer>
		</Grid>
	)
}

export default function App() {
	const [isNewBondOpen, setNewBondOpen] = useState(false)
	const [toUnbond, setToUnbond] = React.useState(null)
	const [stats, setStats] = useState(EMPTY_STATS)

	const refreshStats = () =>
		loadStats()
			.then(setStats)
			.catch(e => console.error("loadStats", e))
	useEffect(() => {
		refreshStats()
		const intvl = setInterval(refreshStats, REFRESH_INTVL)
		return () => clearInterval(intvl)
	}, [])

	// @TODO trigger refreshStats after those
	const onNewBond = bond => createNewBond(stats, bond)
	const onRequestUnbond = async ({ amount, poolId, nonce }) => {
		const provider = new Web3Provider(window.web3.currentProvider)
		const signer = provider.getSigner()
		const stakingWithSigner = new Contract(ADDR_STAKING, StakingABI, signer)
		const tx = await stakingWithSigner.requestUnbond([
			amount,
			poolId,
			nonce || ZERO
		])
		await tx.wait()
	}

	return (
		<MuiThemeProvider theme={themeMUI}>
			<AppBar position="static">
				<Toolbar>
					<img height="40vh" src={logo} alt="logo"></img>
					<Fab
						onClick={() => setNewBondOpen(true)}
						variant="extended"
						color="secondary"
						style={{ position: "absolute", right: "5%", top: "50%" }}
					>
						<AddIcon style={{ margin: themeMUI.spacing(1) }} />
						Stake your ADX
					</Fab>
				</Toolbar>
			</AppBar>

			{// if we set onRequestUnbond to setToUnbond, we will get the confirmation dialog
			Dashboard({ stats, onRequestUnbond: setToUnbond })}

			{UnbondConfirmationDialog({
				toUnbond,
				onDeny: () => setToUnbond(null),
				onConfirm: () => {
					onRequestUnbond(toUnbond)
					setToUnbond(null)
				}
			})}

			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
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
						pools: POOLS,
						maxAmount: stats.userBalance,
						onNewBond
					})}
				</Fade>
			</Modal>
		</MuiThemeProvider>
	)
}

function formatADX(num) {
	return (num.toNumber(10) / ADX_MULTIPLIER).toFixed(2)
}

function getBondId({ owner, amount, poolId, nonce }) {
	return keccak256(
		defaultAbiCoder.encode(
			["address", "address", "uint", "bytes32", "uint"],
			[ADDR_STAKING, owner, amount, poolId, nonce]
		)
	)
}

async function loadStats() {
	const [totalStake, userStats] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserStats()
	])
	return { totalStake, ...userStats }
}

async function loadUserStats() {
	if (!window.web3)
		return {
			loaded: true,
			userBonds: [],
			userBalance: ZERO
		}

	const provider = new Web3Provider(window.web3.currentProvider)
	const signer = provider.getSigner()
	const addr = await signer.getAddress()

	const [bal, logs] = await Promise.all([
		Token.balanceOf(addr),
		provider.getLogs({
			fromBlock: 0,
			address: ADDR_STAKING,
			topics: [null, hexZeroPad(addr, 32)]
		})
	])
	const userBonds = logs.reduce((bonds, log) => {
		const topic = log.topics[0]
		const evs = Staking.interface.events
		if (topic === evs.LogBond.topic) {
			const vals = Staking.interface.parseLog(log).values
			const { owner, amount, poolId, nonce } = vals
			const bond = { owner, amount, poolId, nonce }
			bonds.push({ id: getBondId(bond), status: "Active", ...bond })
		} else if (topic === evs.LogUnbondRequested.topic) {
			// NOTE: assuming that .find() will return something is safe, as long as the logs are properly ordered
			// @TODO: set date of unbond requested
			const { bondId } = Staking.interface.parseLog(log).values
			bonds.find(({ id }) => id === bondId).status = "UnbondRequested"
		} else if (topic === evs.LogUnbonded.topic) {
			const { bondId } = Staking.interface.parseLog(log).values
			bonds.find(({ id }) => id === bondId).status = "Unbonded"
		}
		return bonds
	}, [])
	return {
		loaded: true,
		userBonds,
		userBalance: bal
	}
}

// @TODO handle exceptions
async function createNewBond(stats, { amount, poolId, nonce }) {
	// @TODO handle errors in some way
	if (!poolId) return
	if (!stats.userBalance) return
	if (amount.gt(stats.userBalance)) return
	// @TODO: what if there's no window.web3
	const provider = new Web3Provider(window.web3.currentProvider)
	const signer = provider.getSigner()
	const stakingWithSigner = new Contract(ADDR_STAKING, StakingABI, signer)
	const tokenWithSigner = new Contract(ADDR_ADX, ERC20ABI, signer)
	const allowance = await tokenWithSigner.allowance(
		await signer.getAddress(),
		ADDR_STAKING
	)
	let txns = []
	// Hardcoded gas limit to avoid doing estimateGas - if we do gasEstimate, it will fail on txns[1] cause it depends on txns[0].
	// which isn't going to be mined at the time of signing
	if (!allowance.eq(amount)) {
		if (allowance.gt(ZERO)) {
			txns.push(
				await tokenWithSigner.approve(ADDR_STAKING, ZERO, { gasLimit: 80000 })
			)
		}
		txns.push(
			await tokenWithSigner.approve(ADDR_STAKING, amount, {
				gasLimit: 80000
			})
		)
	}
	txns.push(
		await stakingWithSigner.addBond([amount, poolId, nonce || ZERO], {
			gasLimit: 110000
		})
	)
	const receipts = await Promise.all(txns.map(tx => tx.wait()))
	console.log(receipts)
}
