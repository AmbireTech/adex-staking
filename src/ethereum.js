import { providers } from "ethers"

import { REACT_APP_INFURA_ID } from "./helpers/constants"

export const defaultProvider = new providers.InfuraProvider(
	"homestead",
	REACT_APP_INFURA_ID
)

export async function getSigner(chosenWalletType) {
	// console.log("chosenWalletType", chosenWalletType)
	if (!chosenWalletType || !chosenWalletType.library)
		throw new Error("Wallet not connected")
	return chosenWalletType.library.getSigner()
}
