import React, { Suspense } from "react"
import CssBaseline from "@material-ui/core/CssBaseline"
import { HashRouter as Router } from "react-router-dom"
import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core"
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
import { WALLET_CONNECT } from "./helpers/constants"

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

function getLibrary(provider) {
	return new ethers.providers.Web3Provider(provider)
}

const Web3ReactProviderWalletConnect = createWeb3ReactRoot(WALLET_CONNECT)

export default () => (
	<MultiThemeProvider>
		<CssBaseline />
		<Suspense fallback={<Loading />}>
			<Web3ReactProvider getLibrary={getLibrary}>
				<Web3ReactProviderWalletConnect getLibrary={getLibrary}>
					<App />
				</Web3ReactProviderWalletConnect>
			</Web3ReactProvider>
		</Suspense>
	</MultiThemeProvider>
)
