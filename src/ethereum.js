import { WALLET_CONNECT, METAMASK } from "./helpers/constants"
import { Web3Provider } from "ethers/providers"
import detectEthereumProvider from "@metamask/detect-provider"
import WalletConnectProvider from "@walletconnect/web3-provider"

const { REACT_APP_INFURA_ID } = process.env

const loadInjectedEthereumProvider = new Promise(async (resolve, reject) => {
	const provider = await detectEthereumProvider()

	if (!!window.ethereum && provider !== window.ethereum) {
		console.error("Do you have multiple wallets installed?")
		reject(new Error("Do you have multiple wallets installed?"))
	}

	resolve({
		ethereum: window.ethereum
	})
})

const getMetamaskSelectedAddress = async () => {
	const { ethereum } = await loadInjectedEthereumProvider

	if (ethereum && ethereum.isMetaMask) {
		try {
			const accounts = await ethereum.request({ method: "eth_accounts" })
			return accounts[0]
		} catch (err) {
			console.log(
				"(getInjectedProviderSelectedAddress): Please connect to MetaMask."
			)
			throw new Error(`Please connect to MetaMask. ${err}`)
		}
	}
}

// Works as provider.enable()
const connectMetaMask = async ethereum => {
	try {
		const selectedAccount = await getMetamaskSelectedAddress()

		if (!selectedAccount) {
			await ethereum.request({
				method: "eth_requestAccounts"
			})
		}
	} catch (err) {
		if (err.code === 4001) {
			// EIP-1193 userRejectedRequest error
			// If this happens, the user rejected the connection request.
			console.log("Please connect to MetaMask.")
		} else {
			console.error(err)
		}
	}
}

const getMetamaskSigner = async () => {
	const { ethereum } = await loadInjectedEthereumProvider

	if (ethereum) {
		try {
			await connectMetaMask(ethereum)
			const provider = new Web3Provider(ethereum)
			return provider.getSigner()
		} catch (err) {
			console.error("Err getting MetaMask signer", err)
			throw new Error(`Err getting MetaMask signer: ${err.message}`)
		}
	}

	return null
}

async function getWalletConnectSigner() {
	const provider = new WalletConnectProvider({
		infuraId: REACT_APP_INFURA_ID, // Required
		pollingInterval: 13000
	})

	try {
		await provider.enable()
	} catch (e) {
		console.log("user closed WalletConnect modal")
		return null
	}

	const web3 = new Web3Provider(provider)
	return web3.getSigner()
}

export async function getSigner(walletType) {
	if (!walletType) throw new Error("Wallet type not provided")

	if (walletType === METAMASK) {
		return await getMetamaskSigner()
	} else if (walletType === WALLET_CONNECT) {
		return await getWalletConnectSigner()
	} else {
		throw new Error("Invalid wallet type")
	}
}
