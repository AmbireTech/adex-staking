import { LedgerConnector } from "@web3-react/ledger-connector"
import { TrezorConnector } from "@web3-react/trezor-connector"
import { InjectedConnector } from "@web3-react/injected-connector"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"
import { REACT_APP_RPC_URL } from "../helpers/constants"

const POLLING_INTERVAL = 13000

// NOTE: no 'supportedChainIds' - quick hack in order to activate the connectors with
// all networks and then if it's not supported will will show our network err
// Otherwise WalletConnectConnector will close the connection
// if the wallet is not on the right chain

export const injected = new InjectedConnector({
	// supportedChainIds: []
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
	manifestAppUrl: "https://staking.adex.network",
	config: {
		networkId: 1
	}
})

export const walletconnect = new WalletConnectConnector({
	rpc: { 1: REACT_APP_RPC_URL },
	supportedChainIds: [
		1,
		56,
		137,
		43114,
		250,
		1284,
		1285,
		42161,
		100,
		321,
		10,
		1088,
		25,
		1313161554
	],
	bridge: "https://bridge.walletconnect.org",
	qrcode: true,
	pollingInterval: POLLING_INTERVAL
})
