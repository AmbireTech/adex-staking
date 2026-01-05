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

// NOTE: it cam be completely different on some change of web3 provider or WC connector etc...
export function getWalletConnectPeerMeta(signer) {
	const peerMeta = signer?.provider?.provider?.signer?.connection?.wc?._peerMeta

	return peerMeta
}

export function isAmbireWallet(signer) {
	const peerMeta = getWalletConnectPeerMeta(signer)
	const isAmbire =
		peerMeta?.name === "Ambire Wallet" || signer?.provider?.provider?.isAmbire

	return isAmbire
}

export async function getPeerMeta(chosenWalletType) {
	if (!chosenWalletType && chosenWalletType.library) return null
	const signer = await getSigner(chosenWalletType)
	const peerMeta = getWalletConnectPeerMeta(signer)

	return peerMeta
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
