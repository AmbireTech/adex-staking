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
	userBonds: [],
	userBalance: ZERO,
	totalStake: ZERO
}

function StatsCard({ title, subtitle }) {
	return (
		<Card style={{ margin: themeMUI.spacing(1) }}>
			<CardContent>
				<Typography variant="h6">{subtitle}</Typography>
				<Typography color="textSecondary" variant="subtitle2">
					{title}
				</Typography>
			</CardContent>
		</Card>
	)
}

function NewBondForm({ maxAmount, onNewBond, pools }) {
	// @TODO: should the button be in a FormControl?
	const [bond, setBond] = useState(DEFAULT_BOND)
	return (
		<Paper elevation={2} style={{ padding: themeMUI.spacing(2, 4, 3) }}>
			<h2>Create a bond</h2>
			<FormControl required>
				<TextField
					label="ADX amount"
					type="number"
					onChange={ev =>
						setBond({
							...bond,
							amount: bigNumberify(ev.target.value * ADX_MULTIPLIER)
						})
					}
				></TextField>
			</FormControl>
			<FormControl required>
				<InputLabel>Pool</InputLabel>
				<Select
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
			<FormControl>
				<Button
					color="primary"
					variant="contained"
					onClick={() => onNewBond(bond)}
				>
					Stake ADX
				</Button>
			</FormControl>
		</Paper>
	)
}

export default function App() {
	const [isNewBondOpen, setNewBondOpen] = useState(false)
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

	// @TODO dirty
	const formatADX = num => (num.toNumber(10) / ADX_MULTIPLIER).toFixed(2)

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
		console.log(await tx.wait())
	}

	const userTotalStake = stats.userBonds
		.filter(x => x.status === "Active")
		.map(x => x.amount)
		.reduce((a, b) => a.add(b), ZERO)

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
			<Grid container style={{ padding: themeMUI.spacing(4) }}>
				<Grid item xs={3}>
					{StatsCard({
						title: "Total ADX staked",
						subtitle: formatADX(stats.totalStake) + " ADX"
					})}
				</Grid>

				<Grid item xs={3}>
					{StatsCard({
						title: "Your total active stake",
						subtitle: formatADX(userTotalStake) + " ADX"
					})}
				</Grid>

				<Grid item xs={3}>
					{StatsCard({
						// @TODO
						title: "Your total reward",
						subtitle: "0.00 DAI"
					})}
				</Grid>

				<Grid item xs={3}>
					{StatsCard({
						title: "Your balance",
						subtitle: stats.userBalance
							? formatADX(stats.userBalance) + " ADX"
							: ""
					})}
				</Grid>
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
						<TableBody>
							{(stats.userBonds || []).map(bond => {
								const pool = POOLS.find(x => x.id === bond.poolId)
								const poolLabel = pool ? pool.label : bond.poolId
								return (
									<TableRow key={getBondId(bond)}>
										<TableCell>{formatADX(bond.amount)} ADX</TableCell>
										<TableCell align="right">0.00 DAI</TableCell>
										<TableCell align="right">{poolLabel}</TableCell>
										<TableCell align="right">{bond.status}</TableCell>
										<TableCell align="right">
											{/*<Button>Withdraw Reward</Button> */}
											<Button
												color="primary"
												variant="contained"
												onClick={() => onRequestUnbond(bond)}
											>
												Unbond
											</Button>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Grid>

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
						maxAmount: ZERO,
						onNewBond
					})}
				</Fade>
			</Modal>
		</MuiThemeProvider>
	)
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
		userBonds,
		userBalance: bal
	}
}

// @TODO: split in a separate function
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
