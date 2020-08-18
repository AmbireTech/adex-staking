import React, { useState } from "react"
import { getPool } from "../helpers/bonds"
import {
	parseADX,
	formatADX,
	formatADXPretty,
	getApproxAPY
} from "../helpers/formatting"
import {
	UNBOND_DAYS,
	ZERO,
	DEFAULT_BOND,
	STAKING_RULES_URL
} from "../helpers/constants"
import {
	Paper,
	Grid,
	TextField,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormControlLabel,
	Checkbox
} from "@material-ui/core"
import { themeMUI } from "../themeMUi"

export default function NewBondForm({
	maxAmount,
	onNewBond,
	totalStake,
	pools
}) {
	const [bond, setBond] = useState(DEFAULT_BOND)
	const [stakingAmount, setStakingAmount] = useState(0)
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)
	const [pool, setPool] = useState("")
	const minWidthStyle = { minWidth: "180px" }
	const activePool = getPool(pool)

	const onAction = () => {
		setConfirmation(false)
		onNewBond(bond)
	}

	const stakingRulesFrag = STAKING_RULES_URL ? (
		<>
			&nbsp;and{" "}
			<a target="_blank" rel="noopener noreferrer" href={STAKING_RULES_URL}>
				staking conditions
			</a>
		</>
	) : (
		<></>
	)
	const confirmationLabel = (
		<>
			I understand I am locking up my ADX for at least {UNBOND_DAYS} days and I
			am familiar with the&nbsp;
			<a
				href="https://www.adex.network/tos/"
				target="_blank"
				rel="noopener noreferrer"
			>
				Terms and conditions
			</a>
			{stakingRulesFrag}.
		</>
	)

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
		if (poolToValidate && amountBN.lt(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(
				"ADX amount less than minimum required for selected pool!"
			)
			return
		}
		setAmountErr(false)
		return
	}

	const updateStakingAmount = value => {
		// since its a number input it can be a negative number which wouldn't make sense so we cap it at 0
		const amount = Math.max(0, value)
		const amountBN = parseADX(amount.toString(10))
		validateFields({ amountBN, poolToValidate: activePool })
		setStakingAmount(amount.toString(10))
		setBond({
			...bond,
			amount: amountBN
		})
	}

	const updatePool = value => {
		const amountBN = parseADX(stakingAmount)
		const poolToValidate = getPool(value)
		validateFields({ amountBN, poolToValidate })
		setPool(value)
		setBond({ ...bond, poolId: value })
	}

	const farmer = (
		<span role="img" aria-label="farmer">
			🌾
		</span>
	)

	return (
		<Paper
			elevation={2}
			style={{ width: "500px", padding: themeMUI.spacing(2, 4, 3) }}
		>
			<h2>Create a bond</h2>
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<TextField
						required
						label="ADX amount"
						type="number"
						style={minWidthStyle}
						value={stakingAmount}
						error={amountErr}
						onChange={ev => updateStakingAmount(ev.target.value)}
						helperText={amountErr ? amountErrText : null}
					></TextField>
					<Typography variant="subtitle2">
						Max amount:
						<Button
							onClick={ev => {
								updateStakingAmount(formatADX(maxAmount))
							}}
						>
							{formatADXPretty(maxAmount)} ADX
						</Button>
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<FormControl required>
						<InputLabel>Pool</InputLabel>
						<Select
							style={minWidthStyle}
							value={pool}
							onChange={ev => updatePool(ev.target.value)}
						>
							<MenuItem value={""}>
								<em>None</em>
							</MenuItem>
							{pools.map(({ label, id }) => (
								<MenuItem key={id} value={id}>
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
						<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
							<Typography variant="h6">Pool APY:</Typography>
							<Typography variant="body1">
								{farmer} Current annual yield of{" "}
								{(getApproxAPY(null, totalStake) * 100).toFixed(2)}% {farmer}
							</Typography>
						</Grid>
						<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
							<Typography variant="body1">
								<b>Please sign ALL Metamask transactions that pop up.</b>
							</Typography>
						</Grid>
					</Grid>
				) : (
					""
				)}
				<Grid item xs={12}>
					<FormControlLabel
						style={{ userSelect: "none" }}
						label={confirmationLabel}
						control={
							<Checkbox
								checked={confirmation}
								onChange={ev => setConfirmation(ev.target.checked)}
							/>
						}
					></FormControlLabel>
				</Grid>
				<Grid item xs={12}>
					<FormControl style={{ display: "flex" }}>
						<Button
							disabled={
								!(
									bond.poolId &&
									confirmation &&
									bond.amount.gt(ZERO) &&
									!amountErr
								)
							}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							Stake ADX
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Paper>
	)
}
