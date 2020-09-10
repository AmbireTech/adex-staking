import React from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { themeMUI } from "./themeMUi"
import { BrowserRouter as Router } from "react-router-dom"
import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "ethers/providers"
import Root from "./components/Root"

const App = () => (
	<MuiThemeProvider theme={themeMUI}>
		<Router>
			<Root />
		</Router>
	</MuiThemeProvider>
)

export default () => (
	<Web3ReactProvider getLibrary={provider => new Web3Provider(provider)}>
		<App />
	</Web3ReactProvider>
)
