import React, { useState } from "react"
import { getPool } from "../helpers/bonds"
import { formatADXPretty } from "../helpers/formatting"
import { UNBOND_DAYS, STAKING_RULES_URL } from "../helpers/constants"
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

export default function NewGaslessBondForm({
	bond = {},
	onStake,
	chosenWalletType
}) {
	const { t } = useTranslation()
	const activePool = getPool(bond.poolId) || {}
	const [confirmation, setConfirmation] = useState(false)

	const onAction = () => {
		onStake(onStake)
		setConfirmation(false)
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
							subtitle: bond.amount
								? formatADXPretty(bond.amount) + " ADX"
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
							disabled={!(bond.poolId && confirmation)}
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
