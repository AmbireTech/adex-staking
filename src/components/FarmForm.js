import React, { useState, useContext } from "react"
import {
	getWithdrawActionByFarmPoolId,
	getDepositActionByFarmPoolId,
	isValidNumberString
} from "../actions"
import {
	parseADX,
	formatADX,
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
import AppContext from "../AppContext"
import { useTranslation, Trans } from "react-i18next"

export default function FarmForm({ closeDialog, farmPool, withdraw }) {
	const { t } = useTranslation()
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [actionAmount, setActionAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)

	const actionName = withdraw ? "withdraw" : "deposit"

	const maxAmount = withdraw
		? farmPool.userLPBalance || ZERO
		: stats.userWalletBalance

	const onAction = async () => {
		setConfirmation(false)
		if (closeDialog) closeDialog()

		const action = withdraw
			? getWithdrawActionByFarmPoolId(farmPool)
			: getDepositActionByFarmPoolId(farmPool)

		await wrapDoingTxns(
			action.bind(null, stats, chosenWalletType, parseADX(actionAmount))
		)()
	}

	const confirmationLabel = farmPool.confirmationLabel
	const confirmed = !confirmationLabel || confirmation

	const validateFields = params => {
		const { userInputAmount } = params

		if (!isValidNumberString(userInputAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.invalidAmountInput"))
			return
		}

		const amountBN = parseADX(userInputAmount)

		const minStakingAmountBN = parseADX(farmPool.minStakingAmount || "0")

		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lowADXAmount"))
			return
		}
		if (farmPool && amountBN.lte(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lessDanMinPoolADX"))
			return
		}

		if (
			!withdraw &&
			farmPool &&
			farmPool.poolTotalStaked &&
			farmPool.poolDepositsLimit &&
			amountBN.add(farmPool.poolTotalStaked).gt(farmPool.poolDepositsLimit)
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
						label={t("common.labelADXAmount")}
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
								onAmountChange(formatADX(maxAmount))
							}}
						>
							{t("common.maxAmountBtn", {
								amount: formatADXPretty(maxAmount),
								currency: "ADX"
							})}
						</Button>
					</Box>
				</Grid>

				{farmPool ? (
					<Grid item xs={12} container spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h6">
								{t("common.poolRewardPolicy")}:
							</Typography>
							<Typography variant="body1">
								{t(farmPool.rewardPolicy)}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								{t("common.poolSlashingPolicy")}:
							</Typography>
							<Typography variant="body1">{t(farmPool.slashPolicy)}</Typography>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">{t("common.poolAPY")}:</Typography>
							<Typography variant="body1">
								<Trans
									i18nKey="bonds.currentYield"
									values={{
										apy: (farmPool.poolAPY * 100).toFixed(2),
										sign: "%"
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
						</Grid>
					</Grid>
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
								farmPool
									? farmPool.poolId || actionName
									: "-farm-pool-not-selected"
							)}`}
							disableElevation
							disabled={!confirmed || !!amountErr || !farmPool}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							{withdraw
								? t("common.withdrawCurrency", { currency: "ADX" })
								: t("common.depositCurrency", { currency: "ADX" })}
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
