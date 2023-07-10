import { initializeConnector } from "@web3-react/core"
import { WalletConnect as WalletConnectV2 } from "@web3-react/walletconnect-v2"
import { MetaMask } from "@web3-react/metamask"
import { WC_PROJECT_ID } from "../helpers/constants"

export const walletconnect = initializeConnector(
	actions =>
		new WalletConnectV2({
			actions,
			options: {
				projectId: WC_PROJECT_ID,
				chains: [
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
				showQrModal: true
			}
		})
)

export const metamask = initializeConnector(
	actions => new MetaMask({ actions })
)
