import React, { useEffect, useState, useContext } from "react"
import {
	getDepositPool,
	getDepositActionByPoolId,
	getWithdrawActionByPoolId,
	getPoolStatsByPoolId,
	isValidNumberString,
} from "../actions"
import {
	parseADX,
	formatADX,
	formatADXPretty,
	toIdAttributeString,
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
} from "@material-ui/core"
import { themeMUI } from "../themeMUi"
import AppContext from "../AppContext"

export default function DepositForm({ depositPool, closeDialog, withdraw }) {
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [actionAmount, setActionAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)
	const [newDepositPool, setNewDepositPool] = useState(depositPool || {})

	const activePool = getDepositPool(newDepositPool)
	const poolStats = activePool ? getPoolStatsByPoolId(stats, activePool.id) : {}
	const actionName = withdraw ? "withdraw" : "deposit"

	const maxAmount = withdraw
		? poolStats.balanceLpADX || ZERO
		: stats.userWalletBalance

	const onAction = async () => {
		if (!activePool) {
			return
		}

		setConfirmation(false)
		if (closeDialog) closeDialog()

		const action = withdraw
			? getWithdrawActionByPoolId(activePool.id)
			: getDepositActionByPoolId(activePool.id)

		await wrapDoingTxns(
			action.bind(null, stats, chosenWalletType, parseADX(actionAmount))
		)()
	}

	const confirmationLabel = activePool ? activePool.confirmationLabel : ""
	const confirmed = !confirmationLabel || confirmation

	const validateFields = (params) => {
		const { userInputAmount, poolToValidate, poolStats } = params

		if (!isValidNumberString(userInputAmount)) {
			setAmountErr(true)
			setAmountErrText("Invalid amount input!")
			return
		}

		const amountBN = parseADX(userInputAmount)

		const minStakingAmountBN = poolToValidate
			? parseADX(poolToValidate.minStakingAmount || "0")
			: ZERO
		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText("Insufficient ADX amount!")
			return
		}
		if (poolToValidate && amountBN.lte(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(
				"ADX amount less than minimum required for selected pool!"
			)
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
			setAmountErrText(
				"ADX amount too large - will go over the pool total deposits limit!"
			)
			return
		}

		setAmountErr(false)
		return
	}

	const updatePool = (value) => {
		setNewDepositPool(value)
	}

	const onAmountChange = (amountStr) => {
		setActionAmount(amountStr)
		validateFields({
			userInputAmount: amountStr,
			poolToValidate: activePool,
			poolStats,
		})
	}

	useEffect(() => {
		const poolToValidate = getDepositPool(newDepositPool)
		validateFields({ userInputAmount: actionAmount, poolToValidate, poolStats })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newDepositPool])

	return (
		<Box width={1}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						id={`new-${actionName}-form-amount-field`}
						required
						label="ADX amount"
						type="text"
						value={actionAmount}
						error={amountErr}
						onChange={(ev) => {
							onAmountChange(ev.target.value)
						}}
						helperText={amountErr ? amountErrText : null}
					/>
					<Box mt={1}>
						<Button
							fullWidth
							size="small"
							id={`new-${actionName}-form-max-amount-btn`}
							onClick={() => {
								onAmountChange(formatADX(maxAmount))
							}}
						>
							{`Max amount: ${formatADXPretty(maxAmount)} ADX`}
						</Button>
					</Box>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormControl fullWidth required>
						<InputLabel>Pool</InputLabel>
						<Select
							id={`new-${actionName}-form-pool-select`}
							value={newDepositPool}
							onChange={(ev) => updatePool(ev.target.value)}
						>
							<MenuItem value={""}>
								<em>None</em>
							</MenuItem>
							{DEPOSIT_POOLS.map(({ label, id }) => (
								<MenuItem
									id={`new-${actionName}-form-values-${toIdAttributeString(
										label
									)}`}
									key={id}
									value={id}
								>
									{label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				{activePool ? (
					<Grid item xs={12}>
						<Grid item xs={12}>
							<Typography variant="h6">Pool reward policy:</Typography>
							<Typography variant="body1">{activePool.rewardPolicy}</Typography>
						</Grid>
						<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
							<Typography variant="h6">Pool slashing policy:</Typography>
							<Typography variant="body1">{activePool.slashPolicy}</Typography>
						</Grid>
					</Grid>
				) : (
					""
				)}
				{confirmationLabel && (
					<Grid item xs={12}>
						<FormControlLabel
							style={{ userSelect: "none" }}
							label={confirmationLabel}
							control={
								<Checkbox
									id={`new-${actionName}-form-tos-check`}
									checked={confirmation}
									onChange={(ev) => setConfirmation(ev.target.checked)}
								/>
							}
						></FormControlLabel>
					</Grid>
				)}
				<Grid item xs={12}>
					<FormControl style={{ display: "flex" }}>
						<Button
							id={`new-${actionName}-stake-btn-${toIdAttributeString(
								activePool
									? activePool.poolId || actionName
									: "-deposit-pool-not-selected"
							)}`}
							disableElevation
							disabled={!confirmed || !!amountErr || !activePool}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							{withdraw ? "Withdraw ADX" : "DEPOSIT ADX"}
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
