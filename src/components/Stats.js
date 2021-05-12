import React, { useContext, useEffect, useState } from "react"
import { makeStyles, useTheme } from "@material-ui/core/styles"
import {
	Box,
	MenuItem,
	Select,
	FormControl,
	Grid,
	SvgIcon,
	List,
	ListItem,
	ListItemText
} from "@material-ui/core"
import clsx from "clsx"
import { useLocation } from "react-router-dom"
import { ReactComponent as StatsIcon } from "./../resources/stats-ic.svg"
import SectionHeader from "./SectionHeader"
import ValidatorStatsContext from "../ValidatorStatsContext"
import { DEPOSIT_POOLS } from "../helpers/constants"
import { useTranslation } from "react-i18next"
import StatsCard from "./StatsCard"
import { StatsChart } from "./StatsChart"
import { formatADXPretty, formatNumberPretty } from "../helpers/formatting"

const ACTIVE_BORDER_WIDTH = 3

const poolsSrc = DEPOSIT_POOLS.filter(x => x.hasValidatorStats).map(x => ({
	value: x.validatorId,
	label: x.label,
	pool: x
}))

const chartStatsKeys = [
	"dailyTransactionsData",
	"monthlyTransactionsData",
	"yearlyTransactionsData",
	"dailyPayoutsData"
]

const useStyles = makeStyles(theme => {
	return {
		card: {
			position: "relative",
			backgroundColor: theme.palette.background.paper
		},
		active: {
			backgroundColor: theme.palette.background.darkerPaper,
			border: `${ACTIVE_BORDER_WIDTH}px solid ${theme.palette.background.special}`
		},
		interactive: {
			cursor: "pointer"
		},
		icon: {
			position: "absolute",
			width: theme.spacing(3),
			height: theme.spacing(3),
			top: theme.spacing(1),
			right: theme.spacing(1),
			color: theme.palette.background.special
		}
	}
})

const useQuery = () => {
	return new URLSearchParams(useLocation().search)
}

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
			m={1}
			py={2}
			px={5}
			boxShadow={25}
			onClick={() => chartKey && setKey(chartKey)}
			flexGrow={1}
		>
			{interactive && (
				<SvgIcon className={classes.icon} fontSize="inherit">
					<StatsIcon width="100%" height="100%" />
				</SvgIcon>
			)}
			<Box>
				{StatsCard({
					loaded: loaded,
					title: label,
					subtitle: value
				})}
			</Box>
		</Box>
	)
}

export function PropItem({ name, value }) {
	return (
		<ListItem>
			<ListItemText primary={name} secondary={value} />
		</ListItem>
	)
}

const XSelect = ({ chartDataKey, setChartDataKey, t }) => (
	<FormControl fullWidth size="small" variant="outlined" color="primary">
		<Select
			labelId="pool-stats-key-select-input-labe"
			id="pool-stats-key-select"
			value={chartDataKey}
			onChange={e => {
				setChartDataKey(e.target.value)
			}}
		>
			{chartStatsKeys.map(key => (
				<MenuItem key={key} value={key}>
					{t(`stats.${key}`)}
				</MenuItem>
			))}
		</Select>
	</FormControl>
)

const getDefaultLabels = (labels = []) => [
	labels[0] || "",
	labels[labels.length - 1] || ""
]

export default function Stats() {
	const theme = useTheme()
	const { t } = useTranslation()
	const query = useQuery()

	const [chartDataKey, setChartDataKey] = useState("dailyTransactionsData")
	const [chartData, setChartData] = useState({})

	const { loaded, poolId, setPoolId, pool, setPool, stats } = useContext(
		ValidatorStatsContext
	)

	useEffect(() => {
		// NOTE: if not deep copy there is some s**t with the chart
		// - cache maybe and it mixes up everything
		setChartData(JSON.parse(JSON.stringify({ ...(stats[chartDataKey] || {}) })))
	}, [chartDataKey, stats])

	useEffect(() => {
		const validator = query.get("validator")
		const selected = validator
			? poolsSrc.filter(x => t(x.label === validator))[0]
			: {}

		onPoolSelect(selected.value || poolsSrc[0].value)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	function onPoolSelect(poolId) {
		setPoolId(poolId)
		setPool(poolsSrc.find(x => x.value === poolId).pool)
	}

	return (
		<Box>
			<SectionHeader title={t("common.validatorStats")} />
			<Box m={1} mb={0}>
				<FormControl variant="outlined" size="small">
					{/* <InputLabel id="pool-stats-select-input-label">
						{t("common.pool")}
					</InputLabel> */}
					<Select
						labelId="pool-stats-select-input-labe"
						id="pool-stats-select"
						value={poolId}
						onChange={e => {
							onPoolSelect(e.target.value)
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
					<Grid item xs={12} md={12} lg={7}>
						<Box
							m={1}
							mt={2}
							width={1}
							p={1}
							bgcolor="background.darkerPaper"
							boxShadow={25}
							border={ACTIVE_BORDER_WIDTH}
							borderColor={"background.special"}
						>
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
								yColor={theme.palette.background.special}
								currency={chartData.currency}
								xSelect={XSelect({
									chartDataKey,
									setChartDataKey,
									t
								})}
							/>
						</Box>
					</Grid>
					<Grid item xs={12} md={12} lg={5}>
						<Box>
							<List dense disablePadding>
								<PropItem name={t("common.name")} value={t(pool.label)} />
								<PropItem name={t("common.purpose")} value={t(pool.purpose)} />
								<PropItem
									name={t("common.slashing")}
									value={t(pool.slashPolicy)}
								/>
								<PropItem
									name={t("common.rewards")}
									value={t(pool.rewardPolicy)}
								/>
								<PropItem
									name={t("common.lockup")}
									value={t(pool.lockupPeriodText, {
										count: pool.lockupPeriod || 0
									})}
								/>
								<PropItem
									name={t("common.apyStability")}
									value={t(pool.apyStability)}
								/>
							</List>
						</Box>
					</Grid>
				</Grid>
			</Box>
			<Box mt={2} display="flex" flexDirection="row" flexWrap="wrap">
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
					label={t("stats.totalDeposits")}
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
