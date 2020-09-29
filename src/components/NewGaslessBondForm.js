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
import { themeMUI } from "../themeMUi"
import { ExternalAnchor } from "./Anchor"
import StatsCard from "./StatsCard"

export default function NewGaslessBondForm({
	bond = {},
	onStake,
	chosenWalletType
}) {
	const activePool = getPool(bond.poolId) || {}
	const [confirmation, setConfirmation] = useState(false)

	const onAction = () => {
		onStake(onStake)
		setConfirmation(false)
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
			<ExternalAnchor
				id="new-bond-form-adex-network-tos"
				target="_blank"
				href="https://www.adex.network/tos/"
			>
				Terms and conditions
			</ExternalAnchor>
			{stakingRulesFrag}.
		</>
	)

	const farmer = (
		<span role="img" aria-label="farmer">
			🌾
		</span>
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
			<h2>Create a bond - gasless</h2>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Box mb={1.5}>
						{StatsCard({
							size: "large",
							loaded: true,
							title: "ADX BALANCE ON GASLESS ADDRESS",
							subtitle: bond.amount
								? formatADXPretty(bond.amount) + " ADX"
								: "",
							extra: `Pool: ${activePool.label}`
						})}
					</Box>
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
							Stake ADX
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	)
}
