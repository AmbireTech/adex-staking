import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
const NavBar = () => {
    return(
        <div>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="title" color="inherit">
			AdEx Staking UI
	    	</Typography>
            </Toolbar>
        </AppBar>
        </div>
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
