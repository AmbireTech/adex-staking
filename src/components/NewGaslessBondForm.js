import React, { useState, useContext } from "react"
import { formatADXPretty } from "../helpers/formatting"
import { STAKING_RULES_URL, DEPOSIT_POOLS } from "../helpers/constants"
import { getDepositPool, onStakingPoolV5GaslessDeposit } from "../actions"
import {
	Grid,
	Typography,
	Button,
	FormControl,
	FormControlLabel,
	Checkbox,
	Box
} from "@material-ui/core"
import { ExternalAnchor } from "./Anchor"
import StatsCard from "./StatsCard"
import { useTranslation, Trans } from "react-i18next"
import AppContext from "../AppContext"

export default function NewGaslessBondForm() {
	const { t } = useTranslation()
	const activePool = getDepositPool(DEPOSIT_POOLS[1].id) || {}
	const {
		stats,
		chosenWalletType
		// wrapDoingTxns
	} = useContext(AppContext)

	const { tomStakingV5PoolStats } = stats
	const {
		// gaslessAddress,
		gaslessAddrBalance: adxDepositAmount,
		unbondDays
	} = tomStakingV5PoolStats

	const [confirmation, setConfirmation] = useState(false)

	const onAction = () => {
		// TODO wrap tx
		onStakingPoolV5GaslessDeposit(stats, chosenWalletType, adxDepositAmount)
		setConfirmation(false)
	}

	const confirmationLabel = (
		<Trans
			i18nKey="bonds.confirmationLabel"
			values={{
				unbondDays
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
			<Typography variant="h2">{t("gasless.createNewBond")}</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Box mb={1.5}>
						{StatsCard({
							size: "large",
							loaded: true,
							title: t("gasless.adxBalanceOnAddr"),
							subtitle: adxDepositAmount
								? formatADXPretty(adxDepositAmount) + " ADX"
								: "",
							extra: t("common.poolWithName", {
								name: activePool.label
							})
						})}
					</Box>
				</Grid>

				{!!activePool && (
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
								{t("common.poolSlashingPolicy")}
							</Typography>
							<Typography variant="body1">
								{t(activePool.slashPolicy)}
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
							id={`new-gasless-bond-stake-action-btn`}
							disableElevation
							disabled={confirmation}
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
