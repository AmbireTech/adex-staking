import { LedgerConnector } from "@web3-react/ledger-connector"
import { TrezorConnector } from "@web3-react/trezor-connector"
import { InjectedConnector } from "@web3-react/injected-connector"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"
import { REACT_APP_RPC_URL } from "../helpers/constants"

const POLLING_INTERVAL = 13000

export const injected = new InjectedConnector({
	supportedChainIds: [1, 3, 4, 5, 42]
})

export const ledger = new LedgerConnector({
	chainId: 1,
	url: REACT_APP_RPC_URL,
	pollingInterval: POLLING_INTERVAL
})

export const trezor = new TrezorConnector({
	chainId: 1,
	url: REACT_APP_RPC_URL,
	pollingInterval: POLLING_INTERVAL,
	manifestEmail: "contactus@adex.network",
	manifestAppUrl: "https://adex.network"
})

export const walletconnect = new WalletConnectConnector({
	rpc: { 1: REACT_APP_RPC_URL },
	bridge: "https://bridge.walletconnect.org",
	qrcode: true,
	pollingInterval: POLLING_INTERVAL
})
