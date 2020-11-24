import React from "react"
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
import { UNBOND_DAYS, ZERO } from "../helpers/constants"
import {
	formatADXPretty,
	getApproxAPY,
	formatDate
} from "../helpers/formatting"
import { AmountText } from "./cardCommon"
import Tooltip from "./Tooltip"
import { getPool, getBondId } from "../helpers/bonds"
import { useTranslation } from "react-i18next"

export default function Bonds({ stats, onRequestUnbond, onUnbond }) {
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
			return `Active, earning ${(
				getApproxAPY(bond, stats.totalStakeTom) * 100
			).toFixed(2)}% APY`
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
					{bond.status === "Active" ? (
						<Tooltip title={t("bonds.requestUnbond")}>
							<Box display="inline-block">
								<Button
									id={`request-unbond-${bondId}`}
									variant="contained"
									color="primary"
									onClick={() => onRequestUnbond(bond)}
								>
									{t("bonds.requestUnbond")}
								</Button>
							</Box>
						</Tooltip>
					) : (
						<Tooltip title={unbondDisableMsg}>
							<Box display="inline-block">
								<Button
									id={`unbond-${bondId}`}
									variant="contained"
									disabled={!!unbondDisableMsg}
									onClick={() => onUnbond(bond)}
									color="secondary"
								>
									{t("common.unbond")}
								</Button>
							</Box>
						</Tooltip>
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
		</Box>
	)
}
