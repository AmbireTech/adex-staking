import { AbstractConnector } from "@web3-react/abstract-connector"

export class WC2Connector extends AbstractConnector {
	constructor({ supportedChainIds, defaultChainId }) {
		super({
			supportedChainIds: (() => {
				return [...supportedChainIds]
			})()
		})
		this.defaultChainId = defaultChainId
	}

	activate = async () => {
		const provider = await import("@walletconnect/ethereum-provider").then(
			module => {
				const { chains, optionalChains } = WC2Connector.configuration.chains[
					this.defaultChainId
				]

				return module.default.init({
					projectId: process.env.WC_PROJECT_ID,
					rpcMap: { 1: "rpcurl" }, //TODO
					chains,
					optionalChains,
					showQrModal: true,

					disableProviderPing: true,
					// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/providers/ethereum-provider/src/constants/rpc.ts
					methods: ["eth_sendTransaction", "personal_sign"],
					optionalMethods: [
						"eth_accounts",
						"eth_requestAccounts",
						"eth_sign",
						"eth_signTypedData_v4",
						"wallet_switchEthereumChain",
						"wallet_addEthereumChain"
					],
					events: ["chainChanged", "accountsChanged"],
					optionalEvents: ["disconnect"]
				})
			}
		)

		const accounts = await provider.enable()

		provider.on("accountsChanged", this.handleAccountsChanged)
		provider.on("chainChanged", this.handleChainChanged)
		provider.on("disconnect", this.handleDisconnect)

		this.provider = provider

		return {
			chainId: provider.chainId,
			account: accounts[0],
			provider
		}
	}

	getProvider = async () => {
		if (!this.provider) {
			throw new Error("Provider is undefined")
		}

		return this.provider
	}

	getChainId = async () => {
		if (!this.provider) {
			throw new Error("Provider is undefined")
		}

		return this.provider.chainId
	}

	getAccount = async () => {
		if (!this.provider) {
			throw new Error("Provider is undefined")
		}

		return this.provider.accounts[0]
	}

	getWalletName = () => {
		return this.provider?.session?.peer.metadata.name
	}

	deactivate = () => {
		if (!this.provider) {
			return
		}

		this.emitDeactivate()

		this.provider
			.removeListener("accountsChanged", this.handleAccountsChanged)
			.removeListener("chainChanged", this.handleChainChanged)
			.removeListener("disconnect", this.handleDisconnect)
			.disconnect()
	}

	handleAccountsChanged = accounts => {
		this.emitUpdate({ account: accounts[0] })
	}

	handleChainChanged = chainId => {
		this.emitUpdate({ chainId })
	}

	handleDisconnect = () => {
		if (!this.provider) {
			throw new Error("Provider is undefined")
		}

		this.deactivate()
	}
}
