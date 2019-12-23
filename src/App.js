import React, { Component } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { themeMUI } from './themeMUi'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import logo from 'adex-brand/logos/adex-white.svg'
const NavBar = () => {
    return(
        <MuiThemeProvider theme={themeMUI}>
        <AppBar position="static">
            <Toolbar>
		<img width="100px" src={logo} alt="logo"></img>
                <Typography variant="title" color="inherit">
			Staking
	    	</Typography>
            </Toolbar>
        </AppBar>
        </MuiThemeProvider>
    )
}

class App extends Component {
  render() {
    return (
      <div>
        <NavBar />
      </div>
    )
  }
}
export default App
