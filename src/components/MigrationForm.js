import React, { useEffect, useState, useContext } from "react"
import { getPoolStatsByPoolId, onMigrationToV5Finalize } from "../actions"
import { toIdAttributeString, formatADXPretty } from "../helpers/formatting"
import { DEPOSIT_POOLS, STAKING_RULES_URL, ZERO } from "../helpers/constants"
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
import { ExternalAnchor } from "./Anchor"
import Tooltip from "./Tooltip"

const activePool = DEPOSIT_POOLS[1]

export default function MigrationForm({
	closeDialog,
	bond,
	isWithdrawMigration,
	poolLabel,
	created
}) {
	const { t } = useTranslation()
	const { stats, chosenWalletType, account, wrapDoingTxns } = useContext(
		AppContext
	)

	const { userWalletBalance, tomPoolStats, tomStakingV5PoolStats } = stats
	const { identityAdxRewardsAmount } = tomPoolStats
	const { timeToUnbond } = tomStakingV5PoolStats

	const [claimPendingRewards, setClaimPendingRewards] = useState(true)
	const [stakeWalletBalance, setStakeWalletBalance] = useState(false)
	const [confirmed, setConfirmed] = useState(false)

	const [poolStats, setPoolStats] = useState({})

	const withdrawOnMigration = isWithdrawMigration // TODO: double check this

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
				stakeWalletBalance,
				withdrawOnMigration,
				stats
			)
		)()
	}

	const confirmationLabel = withdrawOnMigration ? (
		<Trans
			i18nKey="bonds.confirmationLabelMigrationWithdraw"
			values={{
				amount: formatADXPretty(
					bond.amount.add(withdrawOnMigration ? identityAdxRewardsAmount : ZERO)
				),
				currency: "ADX",
				walletAddr: account
			}}
		/>
	) : (
		<Trans
			i18nKey="bonds.confirmationLabel"
			values={{
				unbondDays: timeToUnbond
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

	const disableMigrationMsg = !confirmed ? t("bonds.tosNotConfirmed") : ""

	return (
		<Box width={1}>
			<Grid container spacing={2}>
				{activePool ? (
					withdrawOnMigration ? (
						<Box>
							<Typography variant="subtitle1">
								<Trans
									i18nKey="bonds.bondInfo"
									values={{
										amount: formatADXPretty(bond.amount),
										currency: "ADX",
										pool: t(poolLabel),
										created
									}}
									components={{
										box: <Box m={2}></Box>
									}}
								/>
							</Typography>
						</Box>
					) : (
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
					)
				) : (
					""
				)}

				{!identityAdxRewardsAmount.isZero() && (
					<Grid item xs={12}>
						<FormControlLabel
							style={{ userSelect: "none" }}
							label={t("bonds.migrationClaimPendingRewards", {
								amount: formatADXPretty(identityAdxRewardsAmount),
								currency: "ADX"
							})}
							control={
								<Checkbox
									id={`new-migration-v5-form-claim-pending-rewards-check`}
									checked={claimPendingRewards}
									onChange={ev => setClaimPendingRewards(ev.target.checked)}
								/>
							}
						></FormControlLabel>
					</Grid>
				)}

				{!withdrawOnMigration && !userWalletBalance.isZero() && (
					<Grid item xs={12}>
						<FormControlLabel
							style={{ userSelect: "none" }}
							label={t("bonds.stakeWalletBalance", {
								amount: formatADXPretty(userWalletBalance),
								currency: "ADX"
							})}
							control={
								<Checkbox
									id={`new-migration-v5-form-stake-wallet-balance-check`}
									checked={stakeWalletBalance}
									onChange={ev => setStakeWalletBalance(ev.target.checked)}
								/>
							}
						></FormControlLabel>
					</Grid>
				)}

				<Grid item xs={12}>
					<FormControlLabel
						style={{ userSelect: "none" }}
						label={confirmationLabel}
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
					<Tooltip title={disableMigrationMsg}>
						<FormControl style={{ display: "flex" }}>
							<Button
								id={`new-migration-to-v5-stake-btn-${toIdAttributeString(
									activePool ? activePool.poolId : "-not-selected"
								)}`}
								disableElevation
								disabled={!!disableMigrationMsg}
								color="primary"
								variant="contained"
								onClick={onAction}
							>
								{withdrawOnMigration
									? t("bonds.unbondNow")
									: t("bonds.migrateNow")}
							</Button>
						</FormControl>
					</Tooltip>
				</Grid>
			</Grid>
		</Box>
	)
}