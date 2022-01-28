import { providers, utils } from "ethers"

import { useTestnet, REACT_APP_RPC_URL } from "./helpers/constants"

const LocalProvider = REACT_APP_RPC_URL.startsWith("wss://")
	? providers.WebSocketProvider
	: providers.JsonRpcProvider

// TODO: async
export const getDefaultProvider = (function() {
	let defaultProvider = new LocalProvider(
		REACT_APP_RPC_URL,
		useTestnet ? "goerli" : "homestead"
	)

	defaultProvider.on("error", e => {
		console.error("WS Error", e)
		defaultProvider = new LocalProvider(
			REACT_APP_RPC_URL,
			useTestnet ? "goerli" : "homestead"
		)
	})

	return defaultProvider
})()

export function isAmbireWallet(signer) {
	const isWC =
		!!signer &&
		!!signer.provider &&
		!!signer.provider.connection &&
		signer.provider.connection.url === "eip-1193:" &&
		!!signer.provider.provider.isWalletConnect
	const isAmbire =
		isWC &&
		!!signer.provider.provider.signer.connection.wc.peerMeta &&
		signer.provider.provider.signer.connection.wc.peerMeta.name ===
			"Ambire Wallet"
	return isAmbire
}

export async function getSigner(chosenWalletType) {
	if (!chosenWalletType || !chosenWalletType.library)
		throw new Error("Wallet not connected")

	const signer = chosenWalletType.library.getSigner()

	return signer
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
