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
import logo from "./adex-staking.svg"
import { Contract, getDefaultProvider } from "ethers"
import { bigNumberify, id } from "ethers/utils"
import { Web3Provider } from "ethers/providers"
import { StakingABI } from "./abi/Staking"
import { ERC20ABI } from "./abi/ERC20"

const ADDR_ADX = "0x4470bb87d77b963a013db939be332f927f2b992e"
const ADDR_STAKING = "0x4b06542aa382cd8f9863f1281e70a87ce1197930"

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
const DEFAULT_BOND = {
	poolId: "",
	amount: bigNumberify(0)
}

function StatsCard({ title, subtitle }) {
	return (
		<Card>
			<CardContent>{subtitle}</CardContent>
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
						setBond({ ...bond, amount: bigNumberify(ev.target.value) })
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
	const [count, setCount] = useState(0)
	const open = count > 2

	useEffect(() => {
		loadStats().then(console.log)
	}, [])

	// @TODO fix this
	const openNewBond = () => setCount(3)

	return (
		<MuiThemeProvider theme={themeMUI}>
			<AppBar position="static">
				<Toolbar>
					<img height="40vh" src={logo} alt="logo"></img>
					<Fab
						onClick={openNewBond}
						variant="extended"
						color="secondary"
						style={{ position: "absolute", right: "5%", top: "50%" }}
					>
						<AddIcon style={{ margin: themeMUI.spacing(1) }} />
						Stake your ADX
					</Fab>
				</Toolbar>
			</AppBar>

			<Button onClick={() => setCount(count + 1)}>{count}</Button>
			<Grid
				container
				spacing={2}
				style={{ padding: themeMUI.spacing(2, 4, 3) }}
			>
				{[1, 2, 3, 4].map(x => (
					<Grid key={x} item xs={3}>
						{StatsCard({ subtitle: "30,000 ADX" })}
					</Grid>
				))}
			</Grid>
			<TableContainer>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Bond amount</TableCell>
							<TableCell align="right">Reward to collect</TableCell>
							<TableCell align="right">Pool</TableCell>
							<TableCell align="right">Time to unbond</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>10000.00 ADX</TableCell>
							<TableCell align="right">0.00 DAI</TableCell>
							<TableCell align="right">Validator Tom</TableCell>
							<TableCell align="right">-</TableCell>
							<TableCell align="right">
								{/*<Button>Withdraw Reward</Button> */}
								<Button color="primary" variant="contained">
									Unbond
								</Button>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>

			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				open={open}
				onClose={() => setCount(0)}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				}}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500
				}}
			>
				<Fade in={open}>
					{NewBondForm({
						pools: POOLS,
						maxAmount: bigNumberify(0),
						onNewBond: bond => console.log(bond)
					})}
				</Fade>
			</Modal>
		</MuiThemeProvider>
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
			userBalance: bigNumberify(0)
		}

	const provider = new Web3Provider(window.web3.currentProvider)
	const signer = provider.getSigner()
	const addr = await signer.getAddress()
	// @TODO calculate bond ID from the stuff in LogBond
	//const bondId = () =>

	// @TODO: we can get all of them in one call to getLogs
	const [bal, logsBond, logsUnbondReq, logsUnbonded] = await Promise.all([
		Token.balanceOf(addr),
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogBond(addr) }),
		provider.getLogs({
			fromBlock: 0,
			...Staking.filters.LogUnbondRequested(addr)
		}),
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogUnbonded(addr) })
	])
	return {
		userBonds: [],
		userBalance: bal
	}
}
