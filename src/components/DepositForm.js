import React, { useEffect, useState, useContext } from "react"
import {
	getDepositPool,
	getDepositActionByTypeAndPoolId,
	getPoolStatsByPoolId,
	isValidNumberString,
	getDepositActionMaxAmountByTypeAndPoolId,
	DEPOSIT_ACTION_TYPES
} from "../actions"
import {
	parseADX,
	formatADX,
	formatADXPretty,
	toIdAttributeString,
	formatDateTime
} from "../helpers/formatting"
import { DEPOSIT_POOLS, ZERO } from "../helpers/constants"
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
import StatsCard from "./StatsCard"
import { Alert } from "@material-ui/lab"
import { BigNumber } from "ethers"

export default function DepositForm({
	depositPool,
	closeDialog,
	actionType = DEPOSIT_ACTION_TYPES.deposit
}) {
	const { t } = useTranslation()
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [actionAmount, setActionAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [amountErrVals, setAmountErrVals] = useState({})
	const [selectErr, setSelectErr] = useState(false)
	const [selectErrText, setSelectErrText] = useState("")
	const [dirtyInputs, setDirtyInputs] = useState(false)
	const [confirmation, setConfirmation] = useState(false)
	const [rageConfirmed, setRageConfirmed] = useState(false)
	const [activePool, setActivePool] = useState({})
	const [unbondCommitment, setUnbondCommitment] = useState(null)
	const [activeUnbondCommitments, setActiveUnbondCommitments] = useState(null)
	const [maxAmount, setMaxAmount] = useState(ZERO)
	const [poolStats, setPoolStats] = useState({})

	useEffect(() => {
		const newActivePool = getDepositPool(depositPool || {})
		const newPoolStats = newActivePool
			? getPoolStatsByPoolId(stats, newActivePool.id)
			: {}
		const newMaxAmount = getDepositActionMaxAmountByTypeAndPoolId(
			actionType,
			newActivePool.id,
			newPoolStats,
			stats.userWalletBalance
		)

		const newActiveUnbondCommitments = newPoolStats.userLeaves
			? [...newPoolStats.userLeaves].filter(x => !x.withdrawTx)
			: null

		setPoolStats(newPoolStats)
		setActiveUnbondCommitments(newActiveUnbondCommitments)
		setActivePool(newActivePool)
		setMaxAmount(newMaxAmount)
	}, [actionType, depositPool, stats])

	const onAction = async () => {
		if (!activePool) {
			return
		}

		setConfirmation(false)
		if (closeDialog) closeDialog()

		const action = getDepositActionByTypeAndPoolId(actionType, activePool.id)

		await wrapDoingTxns(
			action.bind(
				null,
				stats,
				chosenWalletType,
				parseADX(actionAmount),
				unbondCommitment
			)
		)()
	}

	const confirmationLabel = activePool ? activePool.confirmationLabel : ""
	const rageLeaveConfirmed =
		rageConfirmed || actionType !== DEPOSIT_ACTION_TYPES.rageLeave
	const confirmed = (!confirmationLabel || confirmation) && rageLeaveConfirmed

	useEffect(() => {
		setAmountErr(false)
		setSelectErr(false)
		setAmountErrText("")
		setAmountErrVals({})

		if (
			actionType === DEPOSIT_ACTION_TYPES.withdraw &&
			activePool.id === DEPOSIT_POOLS[1].id &&
			!unbondCommitment
		) {
			setAmountErr(false)
			setAmountErrText("")

			setSelectErr(true)
			setSelectErrText("errors.unbondCommitmentNotSelected")

			return
		}

		if (
			actionType === DEPOSIT_ACTION_TYPES.withdraw &&
			activePool.id === DEPOSIT_POOLS[1].id &&
			unbondCommitment
		) {
			return
		}

		if (!isValidNumberString(actionAmount)) {
			setAmountErr(true)
			setAmountErrText("errors.invalidAmountInput")
			return
		}

		const amountBN = parseADX(actionAmount)

		const minStakingAmountBN = activePool
			? parseADX(activePool.minStakingAmount || "0")
			: ZERO
		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText("errors.lowADXAmount")
			return
		}
		if (activePool && amountBN.lte(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText("errors.lessThanMinPoolADX")
			return
		}

		if (
			actionType === DEPOSIT_ACTION_TYPES.deposit &&
			poolStats &&
			poolStats.poolTotalStaked &&
			poolStats.poolDepositsLimit &&
			amountBN.add(poolStats.poolTotalStaked).gt(poolStats.poolDepositsLimit)
		) {
			setAmountErr(true)
			setAmountErrText("errors.amountOverPoolLimit")
			return
		}

		if (
			actionType === DEPOSIT_ACTION_TYPES.deposit &&
			poolStats &&
			activePool.id === DEPOSIT_POOLS[1].id &&
			amountBN.add(poolStats.currentBalanceADX).gt(activePool.userDepositsLimit)
		) {
			setAmountErr(true)
			setAmountErrText("errors.poolMaxDepositReached")
			setAmountErrVals({
				currentDeposited: formatADXPretty(poolStats.currentBalanceADX),
				depositAmount: formatADXPretty(amountBN),
				userDepositsLimit: formatADXPretty(
					BigNumber.from(activePool.userDepositsLimit)
				),
				currency: "ADX"
			})

			return
		}
	}, [
		actionAmount,
		actionType,
		activePool,
		maxAmount,
		poolStats,
		unbondCommitment
	])

	const onAmountChange = amountStr => {
		setActionAmount(amountStr)
		setDirtyInputs(true)
	}

	const onUnbondCommitmentChange = ev => {
		console.log("ev", ev)
		setUnbondCommitment(ev.target.value)
		setDirtyInputs(true)
	}

	const getActionBtnText = () => {
		switch (actionType) {
			case DEPOSIT_ACTION_TYPES.deposit:
				return t("common.depositCurrency", { currency: "ADX" })
			case DEPOSIT_ACTION_TYPES.withdraw:
				return t("common.withdrawCurrency", { currency: "ADX" })
			case DEPOSIT_ACTION_TYPES.unbondCommitment:
				return t("deposits.makeUnbondCommitment")
			case DEPOSIT_ACTION_TYPES.rageLeave:
				return t("deposits.rageLeave")
			default:
				return "Do it now"
		}
	}

	return (
		<Box width={1}>
			<Grid container spacing={2}>
				{actionType === DEPOSIT_ACTION_TYPES.withdraw &&
				activeUnbondCommitments ? (
					<Grid item xs={12}>
						<FormControl fullWidth required>
							<InputLabel>
								{t("deposits.selectUnbondCommitmentToWithdraw")}
							</InputLabel>
							<Select
								id={`new-${actionType}-unbond-commitment-withdraw-select`}
								value={unbondCommitment || ""}
								onChange={onUnbondCommitmentChange}
							>
								<MenuItem value={""}>
									<em>{t("common.none")}</em>
								</MenuItem>
								{activeUnbondCommitments.map(uc => {
									const disabled = !uc.canWithdraw
									const unlockAt = uc.unlockAt.toNumber()

									return (
										<MenuItem
											disabled={disabled}
											id={`new-${actionType}-form-values-${unlockAt}`}
											key={unlockAt}
											value={uc}
										>
											<Box px={1}>
												{StatsCard({
													loaded: true,
													title: `${t("deposits.unlockAt")} ${formatDateTime(
														Math.ceil(unlockAt * 1000)
													)}`,
													subtitle: `value ${formatADXPretty(uc.adxValue)} ADX`,
													extra: uc.canWithdraw
														? ""
														: !!uc.withdrawTx
														? t("deposits.alreadyWithdrawn")
														: t("deposits.notUnlockedYet")
												})}
											</Box>
										</MenuItem>
									)
								})}
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
							error={dirtyInputs && amountErr}
							onChange={ev => {
								onAmountChange(ev.target.value)
							}}
							helperText={t(
								dirtyInputs && amountErr ? amountErrText : "",
								amountErrVals
							)}
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
				{actionType === DEPOSIT_ACTION_TYPES.rageLeave && (
					<Grid item xs={12}>
						<Alert severity="warning">
							<FormControlLabel
								style={{ userSelect: "none" }}
								label={t("deposits.rageLeaveWarning", {
									lockupPeriod: poolStats.unbondDays,
									percent: (poolStats.rageReceivedPromilles / 10).toFixed(2),
									token: "ADX"
								})}
								control={
									<Checkbox
										id={`new-${actionType}-tos-check`}
										checked={rageConfirmed}
										onChange={ev => setRageConfirmed(ev.target.checked)}
									/>
								}
							></FormControlLabel>
						</Alert>
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
							<Typography variant="h6">
								{t("deposits.lockupPeriodLabel")}:
							</Typography>
							<Typography variant="body1">
								{t("deposits.lockupDays", { count: poolStats.unbondDays })}
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
					<Tooltip title={t(amountErrText || selectErrText || "")}>
						<FormControl style={{ display: "flex" }}>
							<Button
								id={`new-${actionType}-stake-btn-${toIdAttributeString(
									activePool ? activePool.poolId || actionType : "-not-selected"
								)}`}
								disableElevation
								disabled={
									!confirmed || !!amountErr || !activePool || !!selectErr
								}
								color="primary"
								variant="contained"
								onClick={onAction}
							>
								{getActionBtnText()}
							</Button>
						</FormControl>
					</Tooltip>
				</Grid>
			</Grid>
		</Box>
	)
}
