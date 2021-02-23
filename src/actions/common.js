import { Contract } from "ethers"
import { splitSig, Transaction } from "adex-protocol-eth/js"
import IdentityABI from "adex-protocol-eth/abi/Identity"
import FactoryABI from "adex-protocol-eth/abi/IdentityFactory"
import { ADDR_FACTORY, ZERO } from "../helpers/constants"
import { getUserIdentity, zeroFeeTx, rawZeroFeeTx } from "../helpers/identity"
import { ADEX_RELAYER_HOST, PRICES_API_URL } from "../helpers/constants"
import { getSigner, getDefaultProvider, signMessage } from "../ethereum"

const defaultProvider = getDefaultProvider

export async function getPrices() {
	try {
		const res = await fetch(PRICES_API_URL)
		const data = await res.json()

		if (!data.adex) {
			throw new Error("errors.gettingPrices")
		} else {
			return {
				USD: data.adex.usd
			}
		}
	} catch (err) {
		console.error(err)
		return null
	}
}

export async function executeOnIdentity(
	chosenWalletType,
	txns,
	opts = {},
	gasless
) {
	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")
	const walletAddr = await signer.getAddress()
	const { addr, bytecode } = getUserIdentity(walletAddr)
	const identity = new Contract(addr, IdentityABI, signer)

	const needsToDeploy =
		(await defaultProvider.getCode(identity.address)) === "0x"
	const idNonce = needsToDeploy ? ZERO : await identity.nonce()
	const toTuples = offset => ([to, data], i) =>
		zeroFeeTx(
			identity.address,
			idNonce.add(i + offset),
			to,
			data
		).toSolidityTuple()
	if (gasless) {
		// @TODO: we can use execute that calls into executeBySender here to only sign one tx
		const txnsRaw = txns.map(([to, data], i) =>
			rawZeroFeeTx(identity.address, idNonce.add(i), to, data)
		)
		const signatures = []
		for (const tx of txnsRaw) {
			const sig = await signMessage(signer, new Transaction(tx).hash())
			signatures.push(splitSig(sig))
		}

		const executeUrl = `${ADEX_RELAYER_HOST}/staking/${walletAddr}/execute`
		const res = await fetch(executeUrl, {
			method: "POST",
			body: JSON.stringify({
				txnsRaw,
				signatures
			}),
			headers: { "Content-Type": "application/json" }
		})
		if (res.status === 500) throw new Error("errors.relayerInternal")
		return res.json()
	} else if (!needsToDeploy) {
		const txnTuples = txns.map(toTuples(0))
		await identity.executeBySender(txnTuples, opts)
	} else {
		// Has offset because the execute() takes the first nonce
		const txnTuples = txns.map(toTuples(1))
		const executeTx = zeroFeeTx(
			identity.address,
			idNonce,
			identity.address,
			identity.interface.encodeFunctionData("executeBySender", [txnTuples])
		)

		const sig = await signMessage(signer, executeTx.hash())

		const factoryWithSigner = new Contract(ADDR_FACTORY, FactoryABI, signer)
		await factoryWithSigner.deployAndExecute(
			bytecode,
			0,
			[executeTx.toSolidityTuple()],
			[splitSig(sig)],
			opts
		)
	}
}

export function toChannelTuple(args) {
	return [
		args.creator,
		args.tokenAddr,
		args.tokenAmount,
		args.validUntil,
		args.validators,
		args.spec
	]
}
