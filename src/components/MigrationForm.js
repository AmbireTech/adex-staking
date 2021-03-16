import React, { useEffect, useState, useContext } from "react"
import { getPoolStatsByPoolId, onMigrationToV5Finalize } from "../actions"
import { toIdAttributeString } from "../helpers/formatting"
import { DEPOSIT_POOLS } from "../helpers/constants"
import {
	Grid,
	Typography,
	Button,
	FormControl,
	FormControlLabel,
	Checkbox,
	Box
} from "@material-ui/core"
import AppContext from "../AppContext"
import { useTranslation, Trans } from "react-i18next"

const activePool = DEPOSIT_POOLS[1]

export default function MigrationForm({ closeDialog, bond }) {
	const { t } = useTranslation()
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [claimPendingRewards, setClaimPendingRewards] = useState(true)
	const [confirmed, setConfirmed] = useState(false)

	const [poolStats, setPoolStats] = useState({})

	useEffect(() => {
		const newPoolStats = getPoolStatsByPoolId(stats, activePool.id)

		setPoolStats(newPoolStats)
	}, [stats])

	const onAction = async () => {
		if (!bond) {
			return
		}

		setConfirmed(false)
		if (closeDialog) closeDialog()

		await wrapDoingTxns(
			onMigrationToV5Finalize.bind(
				null,
				chosenWalletType,
				bond,
				claimPendingRewards,
				stats
			)
		)()
	}

	return (
		<Box width={1}>
			<Grid container spacing={2}>
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

				<Grid item xs={12}>
					<FormControlLabel
						style={{ userSelect: "none" }}
						label={t("bonds.migrationClainPendingRewards")}
						control={
							<Checkbox
								id={`new-migration-v5-form-claim-pending-rewards-check`}
								checked={claimPendingRewards}
								onChange={ev => setClaimPendingRewards(ev.target.checked)}
							/>
						}
					></FormControlLabel>
				</Grid>

				<Grid item xs={12}>
					<FormControlLabel
						style={{ userSelect: "none" }}
						label={t(activePool.confirmationLabel)}
						control={
							<Checkbox
								id={`new-migration-v5-form-tos-check`}
								checked={confirmed}
								onChange={ev => setConfirmed(ev.target.checked)}
							/>
						}
					></FormControlLabel>
				</Grid>

				<Grid item xs={12}>
					{/* <Tooltip title={}> */}
					<FormControl style={{ display: "flex" }}>
						<Button
							id={`new-migration-to-v5-stake-btn-${toIdAttributeString(
								activePool ? activePool.poolId : "-not-selected"
							)}`}
							disableElevation
							disabled={!confirmed}
							color="primary"
							variant="contained"
							onClick={onAction}
						>
							{t("bonds.migrateNow")}
						</Button>
					</FormControl>
					{/* </Tooltip> */}
				</Grid>
			</Grid>
		</Box>
	)
}
