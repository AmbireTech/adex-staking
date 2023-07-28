import { AbstractConnector } from "@web3-react/abstract-connector"
import { EthereumProvider } from "@walletconnect/ethereum-provider"

export class WC2Connector extends AbstractConnector {
	constructor({
		supportedChainIds,
		defaultChainId,
		showQrModal,
		projectId,
		rpcMap
	}) {
		super({
			supportedChainIds: [...supportedChainIds]
		})
		this.defaultChainId = defaultChainId
		this.showQrModal = showQrModal
		this.projectId = projectId
		this.rpcMap = rpcMap
	}

	activate = async () => {
		const chains = [this.defaultChainId]
		const optionalChains = [...(this.supportedChainIds || [])].filter(
			c => !this.defaultChainId
		)

		const provider = await EthereumProvider.init({
			projectId: this.projectId,
			rpcMap: this.rpcMap,
			chains,
			optionalChains,
			showQrModal: this.showQrModal,
			disableProviderPing: true,
			// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/providers/ethereum-provider/src/constants/rpc.ts
			methods: ["eth_sendTransaction", "personal_sign", "eth_sign"],
			optionalMethods: ["wallet_switchEthereumChain"],
			events: ["chainChanged", "accountsChanged"],
			optionalEvents: ["disconnect"]
		})

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
