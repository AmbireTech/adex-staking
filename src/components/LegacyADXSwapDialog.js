import React, { useEffect, useState } from "react"
import { Contract, getDefaultProvider } from "ethers"
import { bigNumberify, formatUnits } from "ethers/utils"
import ConfirmationDialog from "./ConfirmationDialog"
import { ZERO, ADDR_ADX } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"

const ADDR_ADX_OLD = "0x4470BB87d77b963A013DB939BE332f927f2b992e"
const OLD_TO_NEW_MUL = bigNumberify("100000000000000")

const provider = getDefaultProvider()
const LegacyToken = new Contract(ADDR_ADX_OLD, ERC20ABI, provider)

export default function LegacyADXSwapDialog(getSigner) {
	// Amount to migrate
	const [amount, setAmount] = useState(ZERO)

	useEffect(() => {
		const refreshAmount = async () => {
			const signer = await getSigner()
			if (!signer) return
			const walletAddr = await signer.getAddress()
			setAmount(await LegacyToken.balanceOf(walletAddr))
		}
		refreshAmount().catch(e => console.error(e))
	}, [])

	const content = (
		<div>
			<p>
				The ADX token completed a{" "}
				<a
					target="_blank"
					href="https://www.adex.network/blog/token-upgrade-defi-features/"
				>
					successful upgrade
				</a>{" "}
				to a new contract. You are currently holding{" "}
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
				<i>Swap now</i> button and signing the two MetaMask transactions.
			</p>
		</div>
	)
	return ConfirmationDialog({
		isOpen: amount.gt(ZERO),
		onDeny: () => setAmount(ZERO),
		onConfirm: async () => {
			// @TODO set approval to zero
			// @TODO preexisting approval?
			// @TODO simultanious getSigner fails
			// @TODO error handling
			// @TODO snackbar to show the progress
			setAmount(ZERO)
			const signer = await getSigner()
			const tokenWithSigner = new Contract(ADDR_ADX_OLD, ERC20ABI, signer)
			const newTokenWithSigner = new Contract(ADDR_ADX, ERC20ABI, signer)
			await tokenWithSigner.approve(ADDR_ADX, amount)
			await newTokenWithSigner.swap(amount, { gasLimit: 120000 })
		},
		confirmActionName: "Swap now",
		content
	})
}
