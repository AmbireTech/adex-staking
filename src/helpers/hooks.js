import { useEffect } from "react"
import { useWeb3React } from "@web3-react/core"
import { injected } from "./connector"

export function useInactiveListener(suppress) {
	const { activate } = useWeb3React()

	const handleConnect = () => {
		console.log("Handling 'connect' event")
		activate(injected)
	}

	const handleChainChanged = chainId => {
		console.log("Handling 'chainChanged' event with payload", chainId)
		activate(injected)
	}

	const handleAccountsChanged = accounts => {
		console.log("Handling 'accountsChanged' event with payload KOR", accounts)
		if (accounts.length > 0) {
			window.location.reload()
		}
	}

	const handleNetworkChanged = networkId => {
		console.log("Handling 'networkChanged' event with payload", networkId)
		activate(injected)
	}

	useEffect(() => {
		const { ethereum } = window

		if (ethereum) {
			ethereum.on("connect", handleConnect)
			ethereum.on("chainChanged", handleChainChanged)
			ethereum.on("accountsChanged", handleAccountsChanged)
			ethereum.on("networkChanged", handleNetworkChanged)
		}

		return () => {
			if (ethereum && ethereum.removeListener) {
				ethereum.removeListener("connect", handleConnect)
				ethereum.removeListener("chainChanged", handleChainChanged)
				ethereum.removeListener("accountsChanged", handleAccountsChanged)
				ethereum.removeListener("networkChanged", handleNetworkChanged)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
