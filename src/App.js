import React, { Suspense } from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import { themeMUI } from "./themeMUi"
import { HashRouter as Router } from "react-router-dom"
import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "ethers/providers"
import Root from "./components/Root"
import AppContext from "./AppContext"
import ValidatorStatsContext from "./ValidatorStatsContext"
import useApp from "./AppHooks"
import useValidatorStats from "./ValidatorStatsHooks"
import Loading from "./components/Loading"
import "./App.css"

const App = () => {
	const appHooks = useApp()
	const validatorStatsHooks = useValidatorStats()

	return (
		<React.Fragment>
			<AppContext.Provider value={appHooks}>
				<ValidatorStatsContext.Provider value={validatorStatsHooks}>
					<Router>
						<Root />
					</Router>
				</ValidatorStatsContext.Provider>
			</AppContext.Provider>
		</React.Fragment>
	)
}

export default () => (
	<MuiThemeProvider theme={themeMUI}>
		<CssBaseline />
		<Suspense fallback={<Loading />}>
			<Web3ReactProvider getLibrary={provider => new Web3Provider(provider)}>
				<App />
			</Web3ReactProvider>
		</Suspense>
	</MuiThemeProvider>
)
