import React, { useState, useContext } from "react"
import {
	onLiquidityPoolDeposit,
	onLiquidityPoolWithdraw,
	isValidNumberString
} from "../actions"
import {
	parseTokens,
	formatTokens,
	formatADXPretty,
	toIdAttributeString
} from "../helpers/formatting"
import { ZERO } from "../helpers/constants"
import {
	Grid,
	TextField,
	Typography,
	Button,
	FormControl,
	FormControlLabel,
	Checkbox,
	Box
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import AppContext from "../AppContext"
import { useTranslation, Trans } from "react-i18next"

export default function FarmForm({ closeDialog, pool, stats, withdraw }) {
	const { t } = useTranslation()
	const { chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [actionAmount, setActionAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)

	const actionName = withdraw ? "withdraw" : "deposit"
	const { depositAssetDecimals, depositAssetName } = pool

	const { pendingADX, userLPBalance, walletBalance } = stats

	const maxAmount = withdraw ? userLPBalance || ZERO : walletBalance

	const onAction = async () => {
		setConfirmation(false)

		const action = withdraw ? onLiquidityPoolWithdraw : onLiquidityPoolDeposit

		if (closeDialog) closeDialog()

		await wrapDoingTxns(
			action.bind(null, {
				pool,
				stats,
				chosenWalletType,
				actionAmount: parseTokens(actionAmount, depositAssetDecimals)
			})
		)()
	}

	const confirmationLabel = pool.confirmationLabel
	const confirmed = !confirmationLabel || confirmation

	const validateFields = params => {
		const { userInputAmount } = params

		if (!isValidNumberString(userInputAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.invalidAmountInput"))
			return
		}

		const amountBN = parseTokens(userInputAmount, depositAssetDecimals)

		const minStakingAmountBN = parseTokens(
			pool.minStakingAmount || "0",
			depositAssetDecimals
		)

		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lowADXAmount"))
			return
		}
		if (pool && amountBN.lte(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lessDanMinPoolADX"))
			return
		}

		if (
			!withdraw &&
			pool &&
			stats.poolTotalStaked &&
			pool.poolDepositsLimit &&
			amountBN.add(stats.poolTotalStaked).gt(pool.poolDepositsLimit)
		) {
			setAmountErr(true)
			setAmountErrText(t("errors.amountOverPoolLimit"))
			return
		}

		setAmountErr(false)
		return
	}

	const onAmountChange = amountStr => {
		setActionAmount(amountStr)
		validateFields({
			userInputAmount: amountStr
		})
	}

	return (
		<Box width={1}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={12}>
					<TextField
						fullWidth
						id={`new-farm-${actionName}-form-amount-field`}
						required
						label={t("farm.labelLPTokenAmount", { token: depositAssetName })}
						type="text"
						value={actionAmount}
						error={amountErr}
						onChange={ev => {
							onAmountChange(ev.target.value)
						}}
						helperText={amountErr ? amountErrText : null}
					/>
					<Box mt={1}>
						<Button
							fullWidth
							size="small"
							id={`new-farm-${actionName}-form-max-amount-btn`}
							onClick={() => {
								onAmountChange(formatTokens(maxAmount, depositAssetDecimals))
							}}
						>
							{t("common.maxAmountBtn", {
								amount: formatADXPretty(maxAmount),
								currency: depositAssetName
							})}
						</Button>
					</Box>
				</Grid>

				{withdraw && (
					<Box mt={2}>
						<Alert variant="filled" severity="info">
							{t("farm.withdrawRewardsAlert", { pendingADX, depositAssetName })}
						</Alert>
					</Box>
				)}

				{pool && stats ? (
					<Box my={2}>
						<Typography variant="h6">{t("farm.poolMPY")}:</Typography>
						<Typography variant="body1">
							<Trans
								i18nKey="farm.currentMPYLabel"
								values={{
									mpy: (stats.poolMPY * 100).toFixed(2) + " %"
								}}
								components={{
									farmer: (
										<span role="img" aria-label="farmer">
											🌾
										</span>
									)
								}}
							/>
						</Typography>
					</Box>
				) : (
					""
				)}
				{confirmationLabel && (
					<Grid item xs={12}>
						<FormControlLabel
							style={{ userSelect: "none" }}
							label={t(confirmationLabel)}
							control={
								<Checkbox
									id={`new-${actionName}-form-tos-check`}
									checked={confirmation}
									onChange={ev => setConfirmation(ev.target.checked)}
								/>
							}
						></FormControlLabel>
					</Grid>
				)}
				<Grid item xs={12}>
					<FormControl style={{ display: "flex" }}>
						<Button
							id={`new-${actionName}-farm-btn-${toIdAttributeString(
								pool ? pool.poolId || actionName : "-farm-pool-not-selected"
							)}`}
							disableElevation
							disabled={!confirmed || !!amountErr || !pool || !stats}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							{withdraw
								? t("common.withdrawCurrency", { currency: depositAssetName })
								: t("common.depositCurrency", { currency: depositAssetName })}
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
