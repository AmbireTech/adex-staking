import React, { useEffect, useState, useContext } from "react"
import { getDepositPool, getDepositActionByPoolId } from "../actions"
import {
	parseADX,
	formatADX,
	formatADXPretty,
	toIdAttributeString
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
	Box
} from "@material-ui/core"
import { themeMUI } from "../themeMUi"
import AppContext from "../AppContext"

export default function DepositForm({ depositPool, closeDialog }) {
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [stakingAmount, setStakingAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)
	const [newDepositPool, setNewDepositPool] = useState(depositPool || {})
	const activePool = getDepositPool(newDepositPool)

	const maxAmount = stats.userWalletBalance

	const onAction = async () => {
		setConfirmation(false)
		if (closeDialog) closeDialog()
		const depositAction = getDepositActionByPoolId(activePool.id)
		await wrapDoingTxns(
			depositAction.bind(null, stats, chosenWalletType, parseADX(stakingAmount))
		)()
	}

	const confirmationLabel = activePool ? activePool.confirmationLabel : ""

	const validateFields = params => {
		const { amountBN, poolToValidate } = params
		const minStakingAmountBN = poolToValidate
			? parseADX(poolToValidate.minStakingAmount)
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
		setAmountErr(false)
		return
	}

	const updateStakingAmountBN = amountBN => {
		validateFields({ amountBN, poolToValidate: activePool })
		setStakingAmount(formatADX(amountBN))
	}

	const updatePool = value => {
		setNewDepositPool(value)
	}

	useEffect(() => {
		const amountBN = parseADX(stakingAmount)
		const poolToValidate = getDepositPool(newDepositPool)
		validateFields({ amountBN, poolToValidate })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newDepositPool])

	return (
		<Box width={1}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						id="new-deposit-form-amount-field"
						required
						label="ADX amount"
						type="number"
						value={stakingAmount}
						error={amountErr}
						onChange={ev => {
							// since its a number input it can be a negative number which wouldn't make sense so we cap it at 0
							const amount = Math.max(0, ev.target.value)
							const amountBN = parseADX(amount.toString(10))
							updateStakingAmountBN(amountBN)
							setStakingAmount(amount.toString(10))
						}}
						helperText={amountErr ? amountErrText : null}
					/>
					<Box mt={1}>
						<Button
							fullWidth
							size="small"
							id="new-deposit-form-max-amount-btn"
							onClick={() => {
								updateStakingAmountBN(maxAmount)
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
							id="new-deposit-form-pool-select"
							value={newDepositPool}
							onChange={ev => updatePool(ev.target.value)}
						>
							<MenuItem value={""}>
								<em>None</em>
							</MenuItem>
							{DEPOSIT_POOLS.map(({ label, id }) => (
								<MenuItem
									id={`new-deposit-form-values-${toIdAttributeString(label)}`}
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
									id="new-deposit-form-tos-check"
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
							id={`new-deposit-stake-btn-${toIdAttributeString(
								activePool
									? activePool.poolId || "deposit"
									: "pool-not-selected"
							)}`}
							disableElevation
							disabled={!(confirmation && !amountErr)}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							DEPOSIT ADX
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
