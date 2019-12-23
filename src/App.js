import React, { useEffect } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { themeMUI } from './themeMUi'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import logo from 'adex-brand/logos/adex-white.svg'
import { Contract, getDefaultProvider } from 'ethers'
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

function App() {
	useEffect(() => {
		Token.balanceOf(ADDR_STAKING)
			.then(console.log)

	})
	return (
		<MuiThemeProvider theme={themeMUI}>
			<NavBar />
			<Card>
				<CardContent>30,000 ADX</CardContent>
			</Card>
		</MuiThemeProvider>
	)
}
export default App
