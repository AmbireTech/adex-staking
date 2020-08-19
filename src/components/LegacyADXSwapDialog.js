import React, { useEffect, useState } from "react"
import { Contract, getDefaultProvider } from "ethers"
import { formatUnits } from "ethers/utils"
import ConfirmationDialog from "./ConfirmationDialog"
import { ZERO, ADDR_ADX } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"

const ADDR_ADX_OLD = "0x4470BB87d77b963A013DB939BE332f927f2b992e"

const provider = getDefaultProvider()
const LegacyToken = new Contract(ADDR_ADX_OLD, ERC20ABI, provider)

export default function LegacyADXSwapDialog(getSigner, wrapDoingTxns) {
	// Amount to migrate
	const [amount, setAmount] = useState(ZERO)

	useEffect(() => {
		if (!getSigner) return
		const refreshAmount = async () => {
			const signer = await getSigner()
			if (!signer) return
			const walletAddr = await signer.getAddress()
			setAmount(await LegacyToken.balanceOf(walletAddr))
		}
		refreshAmount().catch(e => console.error(e))
	}, [getSigner])

	const content = (
		<div>
			<p>
				The ADX token completed a{" "}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.adex.network/blog/token-upgrade-defi-features/"
				>
					successful upgrade
				</a>{" "}
				to a new smart contract. You are currently holding{" "}
				<b>{amount.gt(ZERO) ? formatUnits(amount, 4) : ""} legacy ADX</b>.
			</p>
			<p>
				Starting August 21st 2020, the{" "}
				<b>
					legacy ADX will be deprecated and will no longer be traded on
					exchanges
				</b>
				.
			</p>
			<p>
				We recommend that you swap your legacy ADX right now by clicking the{" "}
				<i>
					<b>Swap now</b>
				</i>{" "}
				button and signing the MetaMask transactions.
			</p>
		</div>
	)
	return ConfirmationDialog({
		isOpen: amount.gt(ZERO),
		onDeny: () => setAmount(ZERO),
		onConfirm: wrapDoingTxns(
			swapTokens.bind(null, setAmount, amount, getSigner)
		),
		confirmActionName: "Swap now",
		title: "ADX Token ugprade",
		content
	})
}

async function swapTokens(setAmount, amount, getSigner) {
	setAmount(ZERO)
	const signer = await getSigner()
	const walletAddr = await signer.getAddress()
	const legacyTokenWithSigner = new Contract(ADDR_ADX_OLD, ERC20ABI, signer)
	const newTokenWithSigner = new Contract(
		ADDR_ADX,
		["function swap(uint prevTokenAmount) external"],
		signer
	)
	const allowance = await legacyTokenWithSigner.allowance(walletAddr, ADDR_ADX)
	// this mechanism is used so that we auto-calculate gas on the first tx, but hard-set on the next txns since they depend
	// on the state of the previous
	let hasAutocalculatedGas = false
	const firstTimeGasLimit = gasLimit => {
		if (hasAutocalculatedGas) return { gasLimit }
		hasAutocalculatedGas = true
		return {}
	}
	if (allowance.lt(amount)) {
		if (allowance.gt(ZERO)) {
			await legacyTokenWithSigner.approve(
				ADDR_ADX,
				ZERO,
				firstTimeGasLimit(60000)
			)
		}
		await legacyTokenWithSigner.approve(
			ADDR_ADX,
			amount,
			firstTimeGasLimit(60000)
		)
	}
	await newTokenWithSigner.swap(amount, firstTimeGasLimit(80000))
}