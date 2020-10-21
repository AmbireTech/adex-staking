import { providers, utils } from "ethers"

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

export async function signMessage(signer, message) {
	if (!signer) {
		throw new Error("errors.noSignerProvided")
	}
	if (!message) {
		throw new Error("errors.noMessageProvided")
	}

	const address = await signer.getAddress()
	let sig = ""

	if (signer.provider.provider.isWalletConnect) {
		sig = await signer.provider.send("personal_sign", [
			utils.hexlify(message),
			address
		])
	} else {
		sig = await signer.signMessage(message)
	}

	const verified = (await utils.verifyMessage(message, sig)) === address

	if (!verified) {
		throw new Error("errors.signatureNotVerified")
	}

	return sig
}
