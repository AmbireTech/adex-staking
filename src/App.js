import React, { useEffect, useState } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { themeMUI } from './themeMUi'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import logo from 'adex-brand/logos/adex-white.svg'
import { Contract, getDefaultProvider } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { StakingABI } from './abi/Staking'
import { ERC20ABI } from './abi/ERC20'


const ADDR_ADX = '0x4470bb87d77b963a013db939be332f927f2b992e'
const ADDR_STAKING = '0x4b06542aa382cd8f9863f1281e70a87ce1197930'

const provider = getDefaultProvider()
const Staking = new Contract(ADDR_STAKING, StakingABI, provider)
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)

function NavBar() {
    return (
        <AppBar position="static">
            <Toolbar>
		<img width="100px" src={logo} alt="logo"></img>
                <Typography variant="h4" color="inherit">
			Staking
	    	</Typography>
            </Toolbar>
        </AppBar>
    )
}

export default function App() {
	const [count, setCount] = useState(0)
	useEffect(() => {
		loadStats()
			.then(console.log)

	}, [])
	return (
		<MuiThemeProvider theme={themeMUI}>
			<NavBar />
			<Button onClick={() => setCount(count+1)}>{count}</Button>
			<Grid container spacing={2}>
			{[1,2,3,4].map(x => (
				<Grid key={x} item xs={3}>
					<Card>
						<CardContent>30,000 ADX</CardContent>
					</Card>
				</Grid>
			))
			}
			</Grid>
		</MuiThemeProvider>
	)
}

async function loadStats() {
	const [ totalStake, userBonds ] = await Promise.all([
		Token.balanceOf(ADDR_STAKING),
		loadUserBonds()
	])
	return { totalStake, userBonds }
}

async function loadUserBonds() {
	if (!window.web3) return []

	const provider = new Web3Provider(window.web3.currentProvider)
	const signer = provider.getSigner()
	const addr = await signer.getAddress()
	// @TODO calculate bond ID from the stuff in LogBond
	//const bondId = () => 

	// @TODO: we can get all of them in one call to getLogs
	const [ logsBond, logsUnbondReq, logsUnbonded ] = await Promise.all([
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogBond(addr) }),
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogUnbondRequested(addr) }),
		provider.getLogs({ fromBlock: 0, ...Staking.filters.LogUnbonded(addr) }),
	])
}
