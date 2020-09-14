import React from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
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
		<AppContext.Provider value={appHooks}>
			<MuiThemeProvider theme={themeMUI}>
				<Router>
					<Root />
				</Router>
			</MuiThemeProvider>
		</AppContext.Provider>
	)
}

export default () => (
	<Web3ReactProvider getLibrary={provider => new Web3Provider(provider)}>
		<App />
	</Web3ReactProvider>
)
