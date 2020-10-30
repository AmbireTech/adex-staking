import React, { useEffect, useState } from "react"
import {
	Box,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	Grid
} from "@material-ui/core"
import { POOLS } from "../helpers/constants"
import { useTranslation } from "react-i18next"
import { PropRow } from "./cardCommon"
import StatsCard from "./StatsCard"
import { getValidatorStatsByPoolId } from "../actions/pools"
import { formatADXPretty } from "../helpers/formatting"

const poolsSrc = POOLS.filter(x => x.selectable).map(x => ({
	value: x.id,
	label: x.label,
	pool: x
}))

const ValidatorStatsCard = ({ label, value, loaded }) => (
	<Box m={1} p={2} bgcolor="background.darkerPaper" boxShadow={25}>
		<Box m={1}>
			{StatsCard({
				loaded: loaded,
				title: label,
				subtitle: value
			})}
		</Box>
	</Box>
)

export default function Stats() {
	const { t } = useTranslation()
	const [poolId, setPoolId] = useState(poolsSrc[0].value)
	const [pool, setPool] = useState(poolsSrc[0].pool)
	const [statsByPoolId, setStatsByPoolId] = useState({})
	const [stats, setStats] = useState({})

	const loaded = !!Object.keys(stats).length

	// TODO: add it to app context or new stats context
	useEffect(() => {
		if (!statsByPoolId[poolId]) {
			const newStats = { ...setStatsByPoolId }
			newStats[poolId] = {}
			setStatsByPoolId(newStats)
			setStats(newStats[poolId])

			const updatePoolStats = async () => {
				const stats = await getValidatorStatsByPoolId(poolId)()
				const newStats = { ...setStatsByPoolId }
				newStats[poolId] = stats
				setStatsByPoolId(newStats)
				setStats(newStats[poolId])
			}
			updatePoolStats()
		}
	}, [poolId, statsByPoolId])

	return (
		<Box>
			<Box mb={2}>
				<FormControl>
					<InputLabel id="pool-stats-select-input-label">
						{t("common.pool")}
					</InputLabel>
					<Select
						labelId="pool-stats-select-input-labe"
						id="pool-stats-select"
						value={poolId}
						onChange={e => {
							setPoolId(e.target.value)
							setPool(poolsSrc.find(x => x.value === e.target.value).pool)
						}}
					>
						{poolsSrc.map(({ value, label }) => (
							<MenuItem key={value} value={value}>
								{t(label)}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
			<Box>
				<Grid container spacing={2}>
					<Grid item md={12} lg={7}>
						<Box width={1} height={420} bgcolor="background.special">
							{"GRAPH HERE"}
						</Box>
					</Grid>
					<Grid item md={12} lg={5}>
						<Box>
							<PropRow name={t("common.name")} value={t(pool.label)} />
							<PropRow name={t("common.purpose")} value={t(pool.purpose)} />
							<PropRow
								name={t("common.slashing")}
								value={t(pool.slashPolicy)}
							/>
							<PropRow
								name={t("common.rewards")}
								value={t(pool.rewardPolicy)}
							/>
							<PropRow
								name={t("common.lockup")}
								value={t(pool.lockupPeriodText, {
									count: pool.lockupPeriod || 0
								})}
							/>
							<PropRow
								name={t("common.apyStability")}
								value={t(pool.apyStability)}
							/>
						</Box>
					</Grid>
				</Grid>
			</Box>
			<Box display="flex" flexDirection="row">
				<ValidatorStatsCard
					label={t("stats.totalCampaignsDeposits")}
					value={
						stats.totalDeposits
							? formatADXPretty(stats.totalDeposits) + " DAI"
							: "-"
					}
					loaded={loaded}
				/>
				<ValidatorStatsCard
					label={t("stats.totalPayouts")}
					value={
						stats.totalPayouts
							? formatADXPretty(stats.totalPayouts) + " DAI"
							: "-"
					}
					loaded={loaded}
				/>
			</Box>
		</Box>
	)
}
