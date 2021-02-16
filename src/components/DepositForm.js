import React, { useEffect, useState, useContext } from "react"
import {
	getDepositPool,
	getDepositActionByTypeAndPoolId,
	getPoolStatsByPoolId,
	isValidNumberString,
	DEPOSIT_ACTION_TYPES
} from "../actions"
import {
	parseADX,
	formatADX,
	formatADXPretty,
	toIdAttributeString,
	formatDateTime
} from "../helpers/formatting"
import { ZERO } from "../helpers/constants"
import {
	Grid,
	TextField,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormControlLabel,
	Checkbox,
	Box,
	FormHelperText
} from "@material-ui/core"
import Tooltip from "./Tooltip"
import AppContext from "../AppContext"
import { useTranslation, Trans } from "react-i18next"

export default function DepositForm({
	depositPool,
	closeDialog,
	actionType = DEPOSIT_ACTION_TYPES.deposit,
	userUnbondCommitments,
	withdraw
}) {
	const { t } = useTranslation()
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [actionAmount, setActionAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)
	const [newDepositPool, setNewDepositPool] = useState(depositPool || {})
	const [unbondCommitment, setUnbondCommitment] = useState(null)

	const activePool = getDepositPool(newDepositPool)
	const poolStats = activePool ? getPoolStatsByPoolId(stats, activePool.id) : {}

	const maxAmount = withdraw
		? poolStats.balanceLpADX || ZERO
		: stats.userWalletBalance

	const onAction = async () => {
		if (!activePool) {
			return
		}

		setConfirmation(false)
		if (closeDialog) closeDialog()

		const action = getDepositActionByTypeAndPoolId(actionType, activePool.id)

		await wrapDoingTxns(
			action.bind(null, stats, chosenWalletType, parseADX(actionAmount))
		)()
	}

	const confirmationLabel = activePool ? activePool.confirmationLabel : ""
	const confirmed = !confirmationLabel || confirmation

	const validateFields = params => {
		const { userInputAmount, poolToValidate, poolStats } = params

		if (!isValidNumberString(userInputAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.invalidAmountInput"))
			return
		}

		const amountBN = parseADX(userInputAmount)

		const minStakingAmountBN = poolToValidate
			? parseADX(poolToValidate.minStakingAmount || "0")
			: ZERO
		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lowADXAmount"))
			return
		}
		if (poolToValidate && amountBN.lte(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lessDanMinPoolADX"))
			return
		}

		if (
			!withdraw &&
			poolStats &&
			poolStats.poolTotalStaked &&
			poolStats.poolDepositsLimit &&
			amountBN.add(poolStats.poolTotalStaked).gt(poolStats.poolDepositsLimit)
		) {
			setAmountErr(true)
			setAmountErrText(t("errors.amountOverPoolLimit"))
			return
		}

		setAmountErr(false)
		return
	}

	const updatePool = value => {
		setNewDepositPool(value)
	}

	const onAmountChange = amountStr => {
		setActionAmount(amountStr)
		validateFields({
			userInputAmount: amountStr,
			poolToValidate: activePool,
			poolStats
		})
	}

	useEffect(() => {
		const poolToValidate = getDepositPool(newDepositPool)
		validateFields({ userInputAmount: actionAmount, poolToValidate, poolStats })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newDepositPool])

	const getActionBtnText = () => {
		switch (actionType) {
			case DEPOSIT_ACTION_TYPES.deposit:
				return t("common.depositCurrency", { currency: "ADX" })
			case DEPOSIT_ACTION_TYPES.withdraw:
				return t("common.withdrawCurrency", { currency: "ADX" })
			case DEPOSIT_ACTION_TYPES.unbondCommitment:
				return t("deposits.makeUnbondCommitment")
			default:
				return "Do it now"
		}
	}

	return (
		<Box width={1}>
			<Grid container spacing={2}>
				{actionType === DEPOSIT_ACTION_TYPES.withdraw &&
				userUnbondCommitments &&
				userUnbondCommitments.length ? (
					<Grid item xs={12}>
						<FormControl fullWidth required>
							<InputLabel>
								{t("deposits.selectUnbondCommitmentToWithdraw")}
							</InputLabel>
							<Select
								id={`new-${actionType}-unbond-commitment-withdraw-select`}
								value={unbondCommitment || ""}
								onChange={ev => setUnbondCommitment(ev.target.value)}
							>
								<MenuItem value={""}>
									<em>{t("common.none")}</em>
								</MenuItem>
								{userUnbondCommitments.map(
									({ unlocksAt, maxTokens, canWithdraw, withdrawTx }) => (
										<Tooltip
											key={unlocksAt}
											title={
												canWithdraw
													? ""
													: !!withdrawTx
													? t("deposits.alreadyWithdrawn")
													: t("deposits.notUnlockedYet")
											}
										>
											<Box>
												<MenuItem
													id={`new-${actionType}-form-values-${unlocksAt}`}
													value={unlocksAt}
													disabled={!canWithdraw}
												>
													{`${t("deposits.unlocksAt")} ${formatDateTime(
														Math.ceil(unlocksAt * 1000)
													)} - max ${formatADXPretty(maxTokens)} ADX`}
												</MenuItem>
											</Box>
										</Tooltip>
									)
								)}
							</Select>
							<FormHelperText>
								{t("deposits.selectUnbondCommitmentToWithdrawInfo")}
							</FormHelperText>
						</FormControl>
					</Grid>
				) : (
					<Grid item xs={12}>
						<TextField
							fullWidth
							id={`new-${actionType}-form-amount-field`}
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
								id={`new-${actionType}-form-max-amount-btn`}
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
				)}
				{activePool ? (
					<Grid item xs={12} container spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h6">
								{t("common.poolRewardPolicy")}:
							</Typography>
							<Typography variant="body1">
								{t(activePool.rewardPolicy)}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								{t("common.poolSlashingPolicy")}:
							</Typography>
							<Typography variant="body1">
								{t(activePool.slashPolicy)}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">{t("common.poolAPY")}:</Typography>
							<Typography variant="body1">
								<Trans
									i18nKey="bonds.currentYield"
									values={{
										apy: (poolStats.currentAPY * 100).toFixed(2),
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
									id={`new-${actionType}-form-tos-check`}
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
							id={`new-${actionType}-stake-btn-${toIdAttributeString(
								activePool ? activePool.poolId || actionType : "-not-selected"
							)}`}
							disableElevation
							disabled={!confirmed || !!amountErr || !activePool}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							{getActionBtnText()}
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
