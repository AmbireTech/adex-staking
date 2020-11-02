import React, { useContext } from "react"
import {
	Box,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	Grid
} from "@material-ui/core"
import { commify } from "ethers/utils"
import ValidatorStatsContext from "../ValidatorStatsContext"
import { POOLS } from "../helpers/constants"
import { useTranslation } from "react-i18next"
import { PropRow } from "./cardCommon"
import StatsCard from "./StatsCard"
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

	const { loaded, poolId, setPoolId, pool, setPool, stats } = useContext(
		ValidatorStatsContext
	)

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

				<ValidatorStatsCard
					label={t("stats.dailyPayoutsVolume")}
					value={
						stats.dailyPayoutsVolume
							? formatADXPretty(stats.dailyPayoutsVolume) + " DAI"
							: "-"
					}
					loaded={loaded}
				/>
				<ValidatorStatsCard
					label={t("stats.yearlyTransactions")}
					value={
						stats.yearlyTransactions ? commify(stats.yearlyTransactions) : "-"
					}
					loaded={loaded}
				/>
			</Box>
		</Box>
	)
}
