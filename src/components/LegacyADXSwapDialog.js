import React, { useEffect, useState } from "react"
import { Contract, getDefaultProvider } from "ethers"
import { bigNumberify, formatUnits } from "ethers/utils"
import ConfirmationDialog from "./ConfirmationDialog"
import { ZERO } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"

const ADX_ADDR_OLD = "0x4470BB87d77b963A013DB939BE332f927f2b992e"
const OLD_TO_NEW_MUL = bigNumberify("100000000000000")

const provider = getDefaultProvider()
const LegacyToken = new Contract(ADX_ADDR_OLD, ERC20ABI, provider)

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
				<b>{formatUnits(amount, 4)} legacy ADX</b>.
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
			console.log("swap amount", amount)
			setAmount(ZERO)
			// @TODO
		},
		confirmActionName: "Swap now",
		content
	})
}
