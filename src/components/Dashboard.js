import React, { useState, useEffect } from "react"
import {
	TableRow,
	TableCell,
	Button,
	Grid,
	SnackbarContent,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import InfoIcon from "@material-ui/icons/Info"
import { themeMUI } from "../themeMUi"
import RewardCard from "./RewardCard"
import StatsCard from "./StatsCard"
import {
	ADX_MULTIPLIER,
	UNBOND_DAYS,
	ZERO,
	PRICES_API_URL
} from "../helpers/constants"
import { getPool, getBondId, formatADX } from "../helpers/utils"

export default function Dashboard({
	stats,
	onRequestUnbond,
	onUnbond,
	onClaimRewards
}) {
	const userTotalStake = stats.userBonds
		.filter(x => x.status === "Active")
		.map(x => x.amount)
		.reduce((a, b) => a.add(b), ZERO)

	// USD values
	const [prices, setPrices] = useState({})
	const refreshPrices = () =>
		fetch(PRICES_API_URL)
			.then(r => r.json())
			.then(setPrices)
			.catch(console.error)
	useEffect(() => {
		refreshPrices()
	}, [])
	const inUSD = adxAmount => {
		if (!adxAmount) return null
		if (!prices.USD) return null
		const usdAmount = (adxAmount.toNumber(10) / ADX_MULTIPLIER) * prices.USD
		return `${usdAmount.toFixed(2)} USD`
	}

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
		return bond.status
	}

	const renderBondRow = bond => {
		const pool = getPool(bond.poolId)
		const poolLabel = pool ? pool.label : bond.poolId
		return (
			<TableRow key={getBondId(bond)}>
				<TableCell>{formatADX(bond.currentAmount)} ADX</TableCell>
				<TableCell align="right">0.00 DAI</TableCell>
				<TableCell align="right">{poolLabel}</TableCell>
				<TableCell align="right">{bondStatus(bond)}</TableCell>
				<TableCell align="right">
					{bond.status === "Active" ? (
						<Button color="primary" onClick={() => onRequestUnbond(bond)}>
							Request Unbond
						</Button>
					) : (
						<Button
							disabled={bond.willUnlock.getTime() > Date.now()}
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

	const bondExplanationMsg = (
		<div style={{ display: "flex", alignItems: "center" }}>
			<InfoIcon style={{ marginRight: themeMUI.spacing(2) }} />
			<p>
				This table will show all your individual ADX deposits (bonds), along
				with information as status, amount and earned reward. By using the
				action buttons, you will be able to request unbonding and withdraw your
				ADX after the {UNBOND_DAYS} day lock-up period.
			</p>
		</div>
	)
	const bondExplanationFrag =
		!stats.loaded || stats.userBonds.length ? (
			<></>
		) : (
			<Grid item xs={12} style={{ marginTop: themeMUI.spacing(2) }}>
				<SnackbarContent
					style={{
						fontSize: "15px",
						backgroundColor: themeMUI.palette.primary.main
					}}
					message={bondExplanationMsg}
				></SnackbarContent>
			</Grid>
		)

	const headerCellStyle = { fontWeight: "bold" }
	return (
		<Grid
			container
			style={{
				padding: themeMUI.spacing(4),
				maxWidth: "1200px",
				margin: "auto"
			}}
		>
			<Grid item sm={3} xs={6}>
				{RewardCard({ rewardChannels: stats.rewardChannels, onClaimRewards })}
			</Grid>

			<Grid item sm={3} xs={6}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Total ADX staked",
					extra: inUSD(stats.totalStake),
					subtitle: formatADX(stats.totalStake) + " ADX"
				})}
			</Grid>

			<Grid item sm={3} xs={6}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Your total active stake",
					extra: inUSD(userTotalStake),
					subtitle: formatADX(userTotalStake) + " ADX"
				})}
			</Grid>

			<Grid item sm={3} xs={6}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Your balance",
					subtitle: stats.userBalance
						? formatADX(stats.userBalance) + " ADX"
						: "",
					extra: inUSD(stats.userBalance)
				})}
			</Grid>

			<TableContainer xs={12}>
				<Table
					aria-label="Bonds table"
					style={{ marginTop: themeMUI.spacing(2) }}
				>
					<TableHead>
						<TableRow>
							<TableCell style={headerCellStyle}>Bond amount</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Reward to collect
							</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Pool
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
						{(stats.userBonds || []).reverse().map(renderBondRow)}
					</TableBody>
				</Table>
			</TableContainer>

			{bondExplanationFrag}
		</Grid>
	)
}
