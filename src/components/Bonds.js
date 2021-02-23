import React, { useState } from "react"
import {
	TableRow,
	TableCell,
	Button,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { UNBOND_DAYS, UNBOND_DAYS_V5, ZERO } from "../helpers/constants"
import { formatADXPretty, formatDate } from "../helpers/formatting"
import { AmountText } from "./cardCommon"
import Tooltip from "./Tooltip"
import ConfirmationDialog from "./ConfirmationDialog"
import { getPool, getBondId } from "../helpers/bonds"
import { useTranslation, Trans } from "react-i18next"

export default function Bonds({
	stats,
	// onRequestUnbond,
	onMigrationRequest,
	onUnbond,
	onMigrationFinalize
}) {
	const { t } = useTranslation()
	const [migrationOpen, setMigrationOpen] = useState(false)
	const [bondToMigrate, setBondToMigrate] = useState(null)
	const [isMigrationFinalization, setIsMigrationFinalization] = useState(false)

	// Render all stats cards + bond table
	const bondStatus = bond => {
		if (bond.status === "UnbondRequested") {
			const willUnlock = bond.willUnlock.getTime()
			const now = Date.now()
			if (willUnlock > now) {
				const days = Math.ceil((willUnlock - now) / 86400000)
				return t("bonds.canUnbondIn", { count: days })
			} else {
				return t("bonds.canUnbond")
			}
		}
		if (bond.status === "Active") {
			return `Active, earning ${(stats.tomPoolStats.totalAPY * 100).toFixed(
				2
			)}% APY`
		}
		return bond.status
	}

	const migrate = async () => {
		setMigrationOpen(false)
		if (isMigrationFinalization) {
			onMigrationFinalize(bondToMigrate, stats.rewardChannels)
		} else {
			onMigrationRequest(bondToMigrate)
		}
	}

	const renderBondRow = bond => {
		const pool = getPool(bond.poolId)
		const poolLabel = pool ? pool.label : bond.poolId
		const created = new Date(
			(bond.nonce.gt(ZERO) ? bond.nonce : bond.time).toNumber() * 1000
		)
		const bondId = getBondId(bond)

		const unbondDisableMsg =
			bond.status === "Unbonded"
				? t("bonds.alreadyUnbonded")
				: !bond.willUnlock
				? t("bonds.unbondNotReady")
				: bond.willUnlock.getTime() > Date.now()
				? t("bonds.willUnlockIn", {
						unlockTime: new Date(bond.willUnlock.getTime()).toLocaleDateString()
				  })
				: ""

		const migrationDisableMsg = ""
		// bond.status === "Migrated"
		// 	? t("bonds.alreadyMigrated")
		// 	: !bond.willUnlock
		// 		? t("bonds.migrationNotReady")
		// 		: bond.willUnlock.getTime() > Date.now()
		// 			? t("bonds.willUnlockIn", {
		// 				unlockTime: new Date(bond.willUnlock.getTime()).toLocaleDateString()
		// 			})
		// 			: ""

		return (
			<TableRow key={bondId}>
				<TableCell>
					<AmountText
						text={`${formatADXPretty(bond.currentAmount)} ${"ADX"}`}
						fontSize={17}
					/>
				</TableCell>
				<TableCell align="right">{t(poolLabel)}</TableCell>
				<TableCell align="right">{formatDate(created)}</TableCell>
				<TableCell align="right">{bondStatus(bond)}</TableCell>
				<TableCell align="right">
					{bond.status === "Active" && (
						<Box display="inline-block" m={0.5}>
							<Tooltip title={t("bonds.requestMigrate")}>
								<Box display="inline-block">
									<Button
										id={`request-migration-${bondId}`}
										size="small"
										variant="contained"
										color="primary"
										onClick={() => {
											setBondToMigrate(bond)
											setIsMigrationFinalization(false)
											setMigrationOpen(true)
										}}
									>
										{t("bonds.requestMigrate")}
									</Button>
								</Box>
							</Tooltip>
						</Box>
					)}

					{bond.status === "MigrationRequested" && (
						<Box display="inline-block" m={0.5}>
							<Tooltip title={migrationDisableMsg}>
								<Box display="inline-block">
									<Button
										id={`migrate-finalize-${bondId}`}
										size="small"
										variant="contained"
										disabled={!!migrationDisableMsg}
										onClick={() => {
											setBondToMigrate(bond)
											setIsMigrationFinalization(true)
											setMigrationOpen(true)
										}}
										color="secondary"
									>
										{t("bonds.finalizeMigration")}
									</Button>
								</Box>
							</Tooltip>
						</Box>
					)}

					{(bond.status === "UnbondRequested" ||
						bond.status === "Unbonded") && (
						<Box display="inline-block" m={0.5}>
							<Tooltip title={unbondDisableMsg}>
								<Box display="inline-block">
									<Button
										id={`unbond-${bondId}`}
										size="small"
										variant="contained"
										disabled={!!unbondDisableMsg}
										onClick={() => onUnbond(bond)}
										color="primary"
									>
										{t("common.unbond")}
									</Button>
								</Box>
							</Tooltip>
						</Box>
					)}
				</TableCell>
			</TableRow>
		)
	}

	return (
		<Box>
			<TableContainer xs={12}>
				<Table aria-label="Bonds table">
					<TableHead>
						<TableRow>
							<TableCell>{t("bonds.bondAmount")}</TableCell>
							<TableCell align="right">{t("common.pool")}</TableCell>
							<TableCell align="right">{t("common.created")}</TableCell>
							<TableCell align="right">{t("common.status")}</TableCell>
							<TableCell align="right">{t("common.actions")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{[...(stats.userBonds || [])]
							.filter(x => x.status !== "Unbonded")
							.reverse()
							.map(renderBondRow)}
					</TableBody>
				</Table>
			</TableContainer>

			{!stats.loaded || stats.userBonds.length ? null : (
				<Box mt={2}>
					<Alert variant="filled" severity="info">
						{t("bonds.bondExplanationMsg", { count: UNBOND_DAYS })}
					</Alert>
				</Box>
			)}

			{ConfirmationDialog({
				isOpen: migrationOpen,
				onDeny: () => setMigrationOpen(false),
				onConfirm: () => {
					migrate()
				},
				confirmActionName: isMigrationFinalization
					? t("bonds.finalizeMigration")
					: t("bonds.requestMigrate"),
				content: (
					<Trans
						i18nKey={
							isMigrationFinalization
								? "dialogs.migrationFinalizationConfirmation"
								: "dialogs.migrationRequestConfirmation"
						}
						values={{
							amount: bondToMigrate
								? `${formatADXPretty(bondToMigrate.currentAmount)}`
								: "",
							poolName: bondToMigrate
								? t((getPool(bondToMigrate.poolId) || {}).label || "")
								: "",
							currency: "ADX",
							unbondDays: UNBOND_DAYS_V5,
							extraInfo: isMigrationFinalization
								? t("bonds.migrationFinalizationsInfo")
								: t("bonds.migrationInfo")
						}}
						components={{
							box: <Box mb={2}></Box>
						}}
					/>
				)
			})}
		</Box>
	)
}
