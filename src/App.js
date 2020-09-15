import React from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import { themeMUI } from "./themeMUi"
import { BrowserRouter as Router } from "react-router-dom"
import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "ethers/providers"
import Root from "./components/Root"
import AppContext from "./AppContext"
import useApp from "./AppHooks"

const App = () => {
	const appHooks = useApp()
	return (
		<React.Fragment>
			<MuiThemeProvider theme={themeMUI}>
				<CssBaseline />
				<AppContext.Provider value={appHooks}>
					<Router>
						<Root />
					</Router>
				</AppContext.Provider>
			</MuiThemeProvider>
		</React.Fragment>
	)
}

export default () => (
	<Web3ReactProvider getLibrary={provider => new Web3Provider(provider)}>
		<App />
	</Web3ReactProvider>
)
