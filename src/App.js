import React, { Suspense } from "react"
import CssBaseline from "@material-ui/core/CssBaseline"
import { HashRouter as Router } from "react-router-dom"
import { Web3ReactProvider } from "@web3-react/core"
import { ethers } from "ethers"
import Root from "./components/Root"
import AppContext from "./AppContext"
import ValidatorStatsContext from "./ValidatorStatsContext"
import useApp from "./AppHooks"
import useValidatorStats from "./ValidatorStatsHooks"
import Loading from "./components/Loading"
import MultiThemeProvider from "./MultiThemeProvider"
import { FarmProvider } from "./FarmProvider"
import "./App.css"

const App = () => {
	const appHooks = useApp()
	const validatorStatsHooks = useValidatorStats()

	return (
		<React.Fragment>
			<AppContext.Provider value={appHooks}>
				<FarmProvider>
					<ValidatorStatsContext.Provider value={validatorStatsHooks}>
						<Router>
							<Root />
						</Router>
					</ValidatorStatsContext.Provider>
				</FarmProvider>
			</AppContext.Provider>
		</React.Fragment>
	)
}

export default () => (
	<MultiThemeProvider>
		<CssBaseline />
		<Suspense fallback={<Loading />}>
			<Web3ReactProvider
				getLibrary={provider => new ethers.providers.Web3Provider(provider)}
			>
				<App />
			</Web3ReactProvider>
		</Suspense>
	</MultiThemeProvider>
)
