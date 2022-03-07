import React, { useEffect, useState } from "react"
import { Contract } from "ethers"
import Snackbar from "@material-ui/core/Snackbar"
import MuiAlert from "@material-ui/lab/Alert"
import { utils } from "ethers"
import ConfirmationDialog from "./ConfirmationDialog"
import { ExternalAnchor } from "./Anchor"
import { ZERO, ADDR_ADX } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"
import { getDefaultProvider } from "./../ethereum"
import { useTranslation, Trans } from "react-i18next"

const defaultProvider = getDefaultProvider

const ADDR_ADX_OLD = "0x4470BB87d77b963A013DB939BE332f927f2b992e"

const provider = defaultProvider
const LegacyToken = new Contract(ADDR_ADX_OLD, ERC20ABI, provider)

export default function LegacyADXSwapDialog(
	getSigner,
	wrapDoingTxns,
	chosenWalletType,
	legacySwapInPrg,
	setLegacySwapInPrg,
	legacySwapOpen,
	setLegacySwapInOpen
) {
	const { t } = useTranslation()
	// Amount to migrate
	const [amount, setAmount] = useState(ZERO)
	// const [isSwapInPrg, setSwapInPrg] = useState(false)

	useEffect(() => {
		if (!getSigner || !chosenWalletType.name) return
		const refreshAmount = async () => {
			const signer = await getSigner(chosenWalletType)
			if (!signer) return
			const walletAddr = await signer.getAddress()
			const balance = (await LegacyToken.balanceOf(walletAddr)) || ZERO
			setAmount(balance)
			if (balance.gt(ZERO)) {
				setLegacySwapInOpen(true)
			}
		}
		refreshAmount().catch(e => console.error(e))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getSigner, chosenWalletType])

	const farmer = (
		<span role="img" aria-label="farmer">
			🌾
		</span>
	)
	const content = (
		<div>
			<p>
				<Trans
					i18nKey="legacy.p1"
					values={{
						amount: amount.gt(ZERO) ? utils.formatUnits(amount, 4) : ""
					}}
					components={{
						external: (
							<ExternalAnchor
								color="inherit"
								id="new-bond-form-adex-network-tos"
								target="_blank"
								href={`https://www.adex.network/blog/token-upgrade-defi-features/`}
							/>
						)
					}}
				/>
			</p>
			<p>
				<b>{t("legacy.p2")}</b>
			</p>
			<p>
				<Trans
					i18nKey="legacy.p3"
					values={{
						wallet: chosenWalletType.name || "MetaMask"
					}}
				/>
			</p>
			<p>
				<b>
					<Trans
						i18nKey="legacy.p4"
						values={{
							amount: amount.gt(ZERO) ? utils.formatUnits(amount, 4) : ""
						}}
						components={{
							farmer,
							external: (
								<ExternalAnchor
									color="inherit"
									id="new-bond-form-adex-network-tos"
									target="_blank"
									href={
										"https://www.adex.network/blog/new-token-economics-and-staking/"
									}
								/>
							)
						}}
					/>
				</b>
			</p>
		</div>
	)
	const onSwap = wrapDoingTxns(
		swapTokens.bind(null, setAmount, amount, getSigner, chosenWalletType)
	)
	const dialog = ConfirmationDialog({
		isOpen: legacySwapOpen,
		onDeny: () => setLegacySwapInOpen(false),
		onConfirm: async () => {
			const txns = await onSwap()
			if (!txns) return
			setLegacySwapInPrg(true)
			await Promise.all(txns.map(x => x.wait()))
			setLegacySwapInPrg(false)
		},
		confirmActionName: t("legacy.swapNow"),
		title: t("legacy.adxToUpgrade"),
		content
	})
	return (
		<>
			{dialog}
			<Snackbar open={legacySwapInPrg}>
				<MuiAlert elevation={6} variant="filled" severity="success">
					{t("legacy.swapInProgress")}
				</MuiAlert>
			</Snackbar>
		</>
	)
}

async function swapTokens(setAmount, amount, getSigner, chosenWalletType) {
	const signer = await getSigner(chosenWalletType)
	const walletAddr = await signer.getAddress()
	const legacyTokenWithSigner = new Contract(ADDR_ADX_OLD, ERC20ABI, signer)
	const newTokenWithSigner = new Contract(
		ADDR_ADX,
		["function swap(uint prevTokenAmount) external"],
		signer
	)
	const allowance = await legacyTokenWithSigner.allowance(walletAddr, ADDR_ADX)

	let txns = []
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
			txns.push(
				await legacyTokenWithSigner.approve(
					ADDR_ADX,
					ZERO,
					firstTimeGasLimit(60000)
				)
			)
		}
		txns.push(
			await legacyTokenWithSigner.approve(
				ADDR_ADX,
				amount,
				firstTimeGasLimit(60000)
			)
		)
	}
	txns.push(await newTokenWithSigner.swap(amount, firstTimeGasLimit(100000)))
	setAmount(ZERO)
	return txns
}
