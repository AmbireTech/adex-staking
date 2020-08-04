import React, { useState, useEffect } from "react"
import {
	TableRow,
	TableCell,
	Button,
	Grid,
	Table,
	TableContainer,
	TableHead,
	Link,
	TableBody,
	Box,
	Tooltip
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { themeMUI } from "../themeMUi"
import RewardCard from "./RewardCard"
import StatsCard from "./StatsCard"
import {
	ADX_MULTIPLIER,
	UNBOND_DAYS,
	ZERO,
	PRICES_API_URL
} from "../helpers/constants"
import { getPool, getBondId, formatADX, getApproxAPY } from "../helpers/utils"

export default function Dashboard({
	stats,
	onRequestUnbond,
	onUnbond,
	onClaimRewards
}) {
	const userTotalStake = stats.userBonds
		.filter(x => x.status === "Active")
		.map(x => x.currentAmount)
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
		// @TODO fix this dirty hack?
		const usdAmount =
			(adxAmount.div(100000000000000).toNumber(10) / ADX_MULTIPLIER) *
			prices.USD
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
		return (
			<TableRow key={getBondId(bond)}>
				<TableCell>{formatADX(bond.currentAmount)} ADX</TableCell>
				<TableCell align="right">{poolLabel}</TableCell>
				<TableCell align="right">{bondStatus(bond)}</TableCell>
				<TableCell align="right">
					<Tooltip
						arrow={true}
						title={
							"Coming soon! Adding more ADX will be available after 8th of August."
						}
					>
						<div>
							<Button disabled={true} color="primary">
								Add more ADX
							</Button>
						</div>
					</Tooltip>

					<Tooltip
						arrow={true}
						title={
							"Coming soon! Unbond requests will be available after 8th of August."
						}
					>
						<div>
							{bond.status === "Active" ? (
								<Button
									disabled={true}
									color="primary"
									onClick={() => onRequestUnbond(bond)}
								>
									Request Unbond
								</Button>
							) : (
								<Button
									disabled={true}
									// disabled={bond.willUnlock.getTime() > Date.now()}
									onClick={() => onUnbond(bond)}
									color="secondary"
								>
									Unbond
								</Button>
							)}
						</div>
					</Tooltip>
				</TableCell>
			</TableRow>
		)
	}

	const bondExplanationMsg = `This table will show all your individual ADX deposits (bonds), along
		with information as status, amount and earned reward. By using the
		action buttons, you will be able to request unbonding and withdraw your
		ADX after the ${UNBOND_DAYS} day lock-up period.`

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
		<Grid
			container
			alignItems="stretch"
			style={{
				padding: themeMUI.spacing(4),
				maxWidth: "1200px",
				margin: "auto"
			}}
			spacing={2}
		>
			<Grid item md={3} sm={6} xs={12}>
				{RewardCard({ rewardChannels: stats.rewardChannels, onClaimRewards })}
			</Grid>

			<Grid item md={3} sm={6} xs={12}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Total ADX staked",
					extra: inUSD(stats.totalStake),
					subtitle: formatADX(stats.totalStake) + " ADX"
				})}
			</Grid>

			<Grid item md={3} sm={6} xs={12}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Your total active stake",
					extra: inUSD(userTotalStake),
					subtitle: formatADX(userTotalStake) + " ADX"
				})}
			</Grid>

			<Grid item md={3} sm={6} xs={12}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Your balance",
					subtitle: stats.userBalance
						? formatADX(stats.userBalance) + " ADX"
						: "",
					extra: inUSD(stats.userBalance)
					/*actions: (<Button
							size="small"
							variant="contained"
							color="secondary"
							disabled={true}
						>upgrade</Button>)*/
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
						{[...(stats.userBonds || [])].reverse().map(renderBondRow)}
					</TableBody>
				</Table>
			</TableContainer>

			{bondExplanationFrag}
		</Grid>
	)
}
