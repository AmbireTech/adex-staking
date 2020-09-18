import { providers } from "ethers"

const { REACT_APP_INFURA_ID } = process.env

export const defaultProvider = new providers.InfuraProvider(
	"homestead",
	REACT_APP_INFURA_ID
)

export async function getSigner(chosenWalletType) {
	console.log("chosenWalletType", chosenWalletType)
	if (!chosenWalletType || !chosenWalletType.library)
		throw new Error("library not provided")
	return chosenWalletType.library.getSigner()
}
