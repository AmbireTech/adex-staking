import React from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { UNBOND_DAYS, ZERO } from "../helpers/constants"
import { formatADXPretty, formatDate } from "../helpers/formatting"
import { AmountText } from "./cardCommon"
import { useTranslation } from "react-i18next"
import { getPool, getBondId } from "../helpers/bonds"

import WithDialog from "./WithDialog"
import MigrationForm from "./MigrationForm"

const MigrationDialog = WithDialog(MigrationForm)
const MIGRATION_UNBOND_BEFORE = 1619182800000

export default function Bonds({ stats }) {
	const { t } = useTranslation()
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

	const renderBondRow = bond => {
		const pool = getPool(bond.poolId)
		const poolLabel = pool ? pool.label : bond.poolId
		const created = new Date(
			(bond.nonce.gt(ZERO) ? bond.nonce : bond.time).toNumber() * 1000
		)
		const bondId = getBondId(bond)
		const isWithdrawMigration =
			bond.status === "UnbondRequested" &&
			bond.willUnlock &&
			bond.willUnlock.getTime() < MIGRATION_UNBOND_BEFORE

		// const unbondDisableMsg =
		// 	bond.status === "Unbonded"
		// 		? t("bonds.alreadyUnbonded")
		// 		: !bond.willUnlock
		// 			? t("bonds.unbondNotReady")
		// 			: bond.willUnlock.getTime() > Date.now()
		// 				? t("bonds.willUnlockIn", {
		// 					unlockTime: new Date(bond.willUnlock.getTime()).toLocaleDateString()
		// 				})
		// 				: ""

		// const migrationDisableMsg = ""
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
					{(bond.status === "Active" || bond.status === "UnbondRequested") && (
						<Box display="inline-block" m={0.5}>
							<MigrationDialog
								id="staking-pool-tom-deposit-form"
								title={
									isWithdrawMigration
										? t("bonds.unbond")
										: t("bonds.requestMigrate")
								}
								btnLabel={
									isWithdrawMigration
										? t("bonds.unbond")
										: t("bonds.requestMigrate")
								}
								color="secondary"
								size="small"
								variant="contained"
								bond={bond}
								poolLabel={poolLabel}
								created={created}
								fullWidth
								isWithdrawMigration={isWithdrawMigration}
								// disabled={!!disabledDepositsMsg}
								// tooltipTitle={disabledDepositsMsg}
								// depositPool={DEPOSIT_POOLS[1].id}
								// actionType={DEPOSIT_ACTION_TYPES.deposit}
							/>
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
							.filter(x => x.status !== "Unbonded" && x.status !== "Migrated")
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
		</Box>
	)
}
