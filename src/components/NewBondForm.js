import React, { useEffect, useState, useCallback } from "react"
import { getPool } from "../helpers/bonds"
import {
	parseADX,
	formatADX,
	formatADXPretty,
	toIdAttributeString
} from "../helpers/formatting"
import {
	UNBOND_DAYS,
	ZERO,
	DEFAULT_BOND,
	STAKING_RULES_URL
} from "../helpers/constants"
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
import { ExternalAnchor } from "./Anchor"
import { getPoolStatsByPoolId } from "../actions"
import { useTranslation, Trans } from "react-i18next"

export default function NewBondForm({
	stats,
	onNewBond,
	pools,
	chosenWalletType,
	newBondPool,
	setNewBondPool
}) {
	const { t } = useTranslation()
	const [bond, setBond] = useState(DEFAULT_BOND)
	const [stakingAmount, setStakingAmount] = useState("0.0")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)
	const minWidthStyle = { minWidth: "180px" }
	const activePool = getPool(newBondPool)
	const poolStats = activePool ? getPoolStatsByPoolId(stats, activePool.id) : {}
	const { identityDeployed, userIdentityBalance, userBalance } = stats

	const onlyIdentityBalance = !identityDeployed && userIdentityBalance.gt(ZERO)
	const maxAmount = onlyIdentityBalance ? userIdentityBalance : userBalance

	console.log("onlyIdentityBalance", onlyIdentityBalance)
	console.log("identityDeployed", identityDeployed)
	console.log("userIdentityBalance.gt(ZERO)", userIdentityBalance.gt(ZERO))
	console.log("userIdentityBalance", userIdentityBalance.toString())

	const onAction = () => {
		setConfirmation(false)
		onNewBond(bond)
	}

	const confirmationLabel = (
		<Trans
			i18nKey="bonds.confirmationLabel"
			values={{
				unbondDays: UNBOND_DAYS
			}}
			components={{
				e1: (
					<ExternalAnchor
						id="new-bond-form-adex-network-tos"
						target="_blank"
						href="https://www.adex.network/tos/"
					/>
				),
				e2: STAKING_RULES_URL ? (
					<ExternalAnchor
						id="new-bond-form-adex-staking-rules"
						target="_blank"
						href={STAKING_RULES_URL}
					/>
				) : (
					<></>
				)
			}}
		/>
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const validateFields = params => {
		const { amountBN, poolToValidate } = params
		const minStakingAmountBN = poolToValidate
			? parseADX(poolToValidate.minStakingAmount)
			: ZERO
		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lowADXAmount"))
			return
		}
		if (poolToValidate && amountBN.lt(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lessDanMinPoolADX"))
			return
		}
		setAmountErr(false)
		return
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const updateStakingAmountBN = amountBN => {
		validateFields({ amountBN, poolToValidate: activePool })
		setStakingAmount(formatADX(amountBN))
		setBond({
			...bond,
			amount: amountBN
		})
	}

	const updatePool = value => {
		setNewBondPool(value)
	}

	useEffect(() => {
		const amountBN = parseADX(stakingAmount)
		const poolToValidate = getPool(newBondPool)
		validateFields({ amountBN, poolToValidate })
		setBond({ ...bond, poolId: newBondPool })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newBondPool])

	useEffect(() => {
		if (onlyIdentityBalance) {
			updateStakingAmountBN(userIdentityBalance)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onlyIdentityBalance, userIdentityBalance])

	return (
		<Box
			width={666}
			maxWidth={1}
			m={1}
			maxHeight="90vh"
			p={2}
			pb={4}
			bgcolor="background.paper"
			overflow="auto"
		>
			<h2>{t("bonds.createBond")}</h2>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						id="new-bond-form-amount-field"
						required
						label={t("common.labelADXAmount")}
						type="number"
						style={minWidthStyle}
						value={stakingAmount}
						error={amountErr}
						disabled={onlyIdentityBalance}
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
						{onlyIdentityBalance ? (
							t("bonds.stakeNewAccIdentityBalance", {
								amount: formatADXPretty(userIdentityBalance),
								currency: "ADX"
							})
						) : (
							<Button
								fullWidth
								size="small"
								id="new-bond-form-max-amount-btn"
								onClick={() => {
									updateStakingAmountBN(maxAmount)
								}}
							>
								{t("common.maxAmountBtn", {
									amount: formatADXPretty(maxAmount),
									currency: "ADX"
								})}
							</Button>
						)}
					</Box>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormControl fullWidth required>
						<InputLabel>{t("common.pool")}</InputLabel>
						<Select
							id="new-bond-form-pool-select"
							style={minWidthStyle}
							value={newBondPool}
							onChange={ev => updatePool(ev.target.value)}
						>
							<MenuItem value={""}>
								<em>{t("common.none")}</em>
							</MenuItem>
							{pools.map(({ label, id }) => (
								<MenuItem
									id={`new-bond-form-values-${toIdAttributeString(label)}`}
									key={id}
									value={id}
								>
									{t(label)}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				{!!activePool && (
					<Grid item xs={12}>
						<Grid item xs={12}>
							<Typography variant="h6">
								{t("common.poolRewardPolicy")}:
							</Typography>
							<Typography variant="body1">
								{t(activePool.rewardPolicy)}
							</Typography>
						</Grid>
						<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
							<Typography variant="h6">
								{t("common.poolSlashingPolicy")}:
							</Typography>
							<Typography variant="body1">
								{t(activePool.slashPolicy)}
							</Typography>
						</Grid>
						<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
							<Typography variant="h6">{t("common.poolAPY")}:</Typography>
							<Typography variant="body1">
								<Trans
									i18nKey="bonds.currentYield"
									values={{
										apy: (poolStats.totalAPY * 100).toFixed(2),
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
						<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
							<Typography variant="body1">
								<strong>
									{t("messages.signAllTransactions", {
										wallet: chosenWalletType.name || ""
									})}
								</strong>
							</Typography>
						</Grid>
					</Grid>
				)}
				<Grid item xs={12}>
					<FormControlLabel
						style={{ userSelect: "none" }}
						label={confirmationLabel}
						control={
							<Checkbox
								id="new-bond-form-tos-check"
								checked={confirmation}
								onChange={ev => setConfirmation(ev.target.checked)}
							/>
						}
					></FormControlLabel>
				</Grid>
				<Grid item xs={12}>
					<FormControl style={{ display: "flex" }}>
						<Button
							id={`new-bond-stake-btn-${toIdAttributeString(
								bond ? bond.poolId || "bond" : "pool-not-selected"
							)}`}
							disableElevation
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
							{t("bonds.stakeADX")}
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
