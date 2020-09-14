import React, { Fragment } from "react"
import {
	TableRow,
	TableCell,
	Button,
	Grid,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { themeMUI } from "../themeMUi"
import { UNBOND_DAYS, ZERO } from "../helpers/constants"
import {
	formatADXPretty,
	getApproxAPY,
	formatDate
} from "../helpers/formatting"
import { getPool, getBondId } from "../helpers/bonds"

export default function Dashboard({ stats, onRequestUnbond, onUnbond }) {
	// Render all stats cards + bond table
	const bondStatus = bond => {
		if (bond.status === "UnbondRequested") {
			const willUnlock = bond.willUnlock.getTime()
			const now = Date.now()
			if (willUnlock > now) {
				const days = Math.ceil((willUnlock - now) / 86400000)
				return `Can unbond in ${days} days`
			} else {
				return "Can unbond"
			}
		}
		if (bond.status === "Active") {
			return `Active, earning ${(
				getApproxAPY(bond, stats.totalStake) * 100
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
		return (
			<TableRow key={getBondId(bond)}>
				<TableCell>{formatADXPretty(bond.currentAmount)} ADX</TableCell>
				<TableCell align="right">{poolLabel}</TableCell>
				<TableCell align="right">{formatDate(created)}</TableCell>
				<TableCell align="right">{bondStatus(bond)}</TableCell>
				<TableCell align="right">
					{bond.status === "Active" ? (
						<Button color="primary" onClick={() => onRequestUnbond(bond)}>
							Request Unbond
						</Button>
					) : (
						<Button
							disabled={
								bond.status === "Unbonded" ||
								!bond.willUnlock ||
								bond.willUnlock.getTime() > Date.now()
							}
							onClick={() => onUnbond(bond)}
							color="secondary"
						>
							Unbond
						</Button>
					)}
				</TableCell>
			</TableRow>
		)
	}

	const bondExplanationMsg = `This table will show all your individual ADX deposits in validator pools (bonds), 
	along with information as status, amount and current APY. By using the action buttons, 
	you will be able to request unbonding and withdraw your ADX after the ${UNBOND_DAYS} day lock-up period.`

	const bondExplanationFrag =
		!stats.loaded || stats.userBonds.length ? (
			<></>
		) : (
			<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
				<Alert square elevation={6} variant="filled" severity="info">
					{bondExplanationMsg}
				</Alert>
			</Grid>
		)

	const headerCellStyle = { fontWeight: "bold" }
	return (
		<Fragment>
			<TableContainer xs={12}>
				<Table
					aria-label="Bonds table"
					style={{ marginTop: themeMUI.spacing(2) }}
				>
					<TableHead>
						<TableRow>
							<TableCell style={headerCellStyle}>Bond amount</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Pool
							</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Created
							</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Status
							</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Actions
							</TableCell>
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

			{bondExplanationFrag}
		</Fragment>
	)
}
