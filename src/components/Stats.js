import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	Grid,
	SvgIcon
} from "@material-ui/core"
import clsx from "clsx"
import { ReactComponent as StatsIcon } from "./../resources/stats-ic.svg"
import SectionHeader from "./SectionHeader"
import ValidatorStatsContext from "../ValidatorStatsContext"
import { POOLS } from "../helpers/constants"
import { useTranslation } from "react-i18next"
import { PropRow } from "./cardCommon"
import StatsCard from "./StatsCard"
import { StatsChart } from "./StatsChart"
import { formatADXPretty, formatNumberPretty } from "../helpers/formatting"
import { BACKGROUND_SPECIAL } from "../themeMUi"

const poolsSrc = POOLS.filter(x => x.selectable).map(x => ({
	value: x.id,
	label: x.label,
	pool: x
}))

const useStyles = makeStyles(theme => {
	return {
		card: {
			position: "relative",
			backgroundColor: theme.palette.background.darkerPaper
		},
		active: {
			backgroundColor: theme.palette.background.paper
		},
		interactive: {
			cursor: "pointer"
		},
		icon: {
			position: "absolute",
			width: theme.spacing(4),
			height: theme.spacing(4),
			top: theme.spacing(1),
			right: theme.spacing(1),
			color: theme.palette.background.special
		}
	}
})

const ValidatorStatsCard = ({
	label,
	value,
	loaded,
	currentKey,
	chartKey,
	setKey
}) => {
	const classes = useStyles()
	const active = chartKey && currentKey && currentKey === chartKey
	const interactive = !!chartKey
	return (
		<Box
			className={clsx(classes.card, {
				[classes.active]: active,
				[classes.interactive]: interactive
			})}
			mr={2}
			mb={2}
			p={4}
			boxShadow={25}
			onClick={() => chartKey && setKey(chartKey)}
		>
			{interactive && (
				<SvgIcon className={classes.icon} fontSize="inherit">
					<StatsIcon width="100%" height="100%" />
				</SvgIcon>
			)}
			<Box m={1}>
				{StatsCard({
					loaded: loaded,
					title: label,
					subtitle: value
				})}
			</Box>
		</Box>
	)
}

const getDefaultLabels = (labels = []) => [
	labels[0] || "",
	labels[labels.length - 1] || ""
]

export default function Stats() {
	const { t } = useTranslation()
	const [chartDataKey, setChartDataKey] = useState("yearlyTransactionsData")
	const [chartData, setChartData] = useState({})

	const { loaded, poolId, setPoolId, pool, setPool, stats } = useContext(
		ValidatorStatsContext
	)

	useEffect(() => {
		setChartData(stats[chartDataKey] || {})
	}, [chartDataKey, stats])

	return (
		<Box>
			<SectionHeader title={t("common.validatorStats")} />
			<Box mt={2}>
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
			<Box mt={2}>
				<Grid container spacing={2}>
					<Grid item md={12} lg={7}>
						<Box width={1} p={1} bgcolor="background.paper">
							<StatsChart
								options={{
									title: t(`stats.${chartDataKey}`)
								}}
								defaultLabels={getDefaultLabels(chartData.labels)}
								data={chartData}
								dataActive={true}
								dataSynced={loaded}
								xLabel={t(`stats.${chartDataKey}`)}
								yLabel={t(chartData.valueLabel)}
								yColor={BACKGROUND_SPECIAL}
								currency={chartData.currency}
							/>
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
			<Box mt={2} display="flex" flexDirection="row" flexWrap="wrap">
				<ValidatorStatsCard
					label={t("stats.yearlyTransactions")}
					value={
						stats.yearlyTransactions
							? formatNumberPretty(stats.yearlyTransactions)
							: "-"
					}
					loaded={loaded}
					currentKey={chartDataKey}
					chartKey={"yearlyTransactionsData"}
					setKey={setChartDataKey}
				/>
				<ValidatorStatsCard
					label={t("stats.dailyPayoutsVolume")}
					value={
						stats.dailyPayoutsVolume
							? formatADXPretty(stats.dailyPayoutsVolume) + " DAI"
							: "-"
					}
					loaded={loaded}
					currentKey={chartDataKey}
					chartKey={"dailyPayoutsData"}
					setKey={setChartDataKey}
				/>
				<ValidatorStatsCard
					label={t("stats.dailyTransactions")}
					value={
						stats.dailyTransactions
							? formatNumberPretty(stats.dailyTransactions)
							: "-"
					}
					loaded={loaded}
					currentKey={chartDataKey}
					chartKey={"dailyTransactionsData"}
					setKey={setChartDataKey}
				/>
				<ValidatorStatsCard
					label={t("stats.monthlyTransactions")}
					value={
						stats.monthlyTransactions
							? formatNumberPretty(stats.monthlyTransactions)
							: "-"
					}
					loaded={loaded}
					currentKey={chartDataKey}
					chartKey={"monthlyTransactionsData"}
					setKey={setChartDataKey}
				/>

				<ValidatorStatsCard
					label={t("stats.totalCampaigns")}
					value={
						stats.totalCampaigns
							? formatNumberPretty(stats.totalCampaigns)
							: "-"
					}
					loaded={loaded}
				/>
				<ValidatorStatsCard
					label={t("stats.uniqueUnits")}
					value={
						stats.uniqueUnits ? formatNumberPretty(stats.uniqueUnits) : "-"
					}
					loaded={loaded}
				/>
				<ValidatorStatsCard
					label={t("stats.uniquePublishers")}
					value={
						stats.uniquePublishers
							? formatNumberPretty(stats.uniquePublishers)
							: "-"
					}
					loaded={loaded}
				/>
				<ValidatorStatsCard
					label={t("stats.uniqueAdvertisers")}
					value={
						stats.uniqueAdvertisers
							? formatNumberPretty(stats.uniqueAdvertisers)
							: "-"
					}
					loaded={loaded}
				/>
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
					label={t("stats.lockupOnChain")}
					value={
						stats.lockupOnChain
							? formatADXPretty(stats.lockupOnChain) + " DAI"
							: "-"
					}
					loaded={loaded}
				/>
			</Box>
		</Box>
	)
}
