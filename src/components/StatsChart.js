import React from "react"
import { Line } from "react-chartjs-2"
import { SECONDARY } from "../themeMUi"
import { Box, Typography } from "@material-ui/core"
import { hexToRgbaColorString } from "../helpers/colors"
import { useWindowSize } from "../hooks/windowSize"
import { useTranslation } from "react-i18next"
import { formatNumberPretty } from "../helpers/formatting"

const commonDsProps = {
	fill: false,
	lineTension: 0,
	borderWidth: 2,
	pointRadius: 2,
	pointHitRadius: 10
}

const DEFAULT_FONT_SIZE = 14.2
const FONT = "Roboto"

const DefaultLabel = ({ label = "", align }) =>
	label.split("-").map((x, index, all) => (
		<Typography key={x + index} component="div" variant="caption" align={align}>
			{x}
		</Typography>
	))

export const StatsChart = ({
	data,
	dataSynced = false,
	dataActive = true,
	defaultLabels = [],
	options = {},
	xLabel = "TIMEFRAME",
	yLabel = "DATA",
	yColor = SECONDARY,
	currency
}) => {
	const windowSize = useWindowSize()
	const chartHeight = Math.min(
		Math.max(Math.floor((windowSize.height || 0) / 2.2), 240),
		420
	)
	const { t } = useTranslation()

	const chartData = {
		labels: dataSynced ? data.labels : defaultLabels,
		datasets: [
			{
				...commonDsProps,
				backgroundColor: hexToRgbaColorString(yColor, 1),
				borderColor: hexToRgbaColorString(yColor, 1),
				label: yLabel,
				data: dataSynced ? data.datasets : [],
				yAxisID: "y-axis-1",
				hidden: !dataActive
			}
		]
	}

	const linesOptions = {
		animation: false,
		responsive: true,
		layout: {
			padding: {
				top: 16
			}
		},

		// This and fixed height are used for proper mobile display of the chart
		maintainAspectRatio: false,
		title: {
			display: false,
			text: options.title
		},
		legend: {
			display: false
		},
		tooltips: {
			backgroundColor: "black",
			mode: "index",
			intersect: false,
			titleFontSize: DEFAULT_FONT_SIZE,
			bodyFontSize: DEFAULT_FONT_SIZE,
			bodyFontFamily: FONT,
			titleFontFamily: FONT,
			xPadding: 8,
			yPadding: 8,
			cornerRadius: 0,
			bodySpacing: 4,
			caretSize: 8,
			displayColors: true,
			callbacks: {
				label: function(t, d) {
					// This adds currency (DAI) to label in the tooltips if needed
					var xLabel = d.datasets[t.datasetIndex].label
					var yLabel = currency
						? `${formatNumberPretty(t.yLabel)} ${currency}`
						: `${formatNumberPretty(t.yLabel)}`
					return `${xLabel}: ${yLabel}`
				}
			}
		},
		hover: {
			mode: "index",
			intersect: false
		},

		scales: {
			xAxes: [
				{
					display: true,
					gridLines: {
						display: true,
						drawBorder: true,
						drawTicks: true
					},
					scaleLabel: {
						display: false,
						labelString: t(xLabel || "TIMEFRAME"),
						fontSize: DEFAULT_FONT_SIZE,
						fontFamily: FONT
					},
					ticks: {
						autoSkip: true,
						maxTicksLimit: 2,
						maxRotation: 0,
						padding: -24,
						fontSize: DEFAULT_FONT_SIZE,
						fontFamily: FONT,
						callback: () => ""
					}
				}
			],
			yAxes: [
				{
					// NOTE: this one is just to show constant size grid lines
					display: true,
					gridLines: {
						display: true,
						drawBorder: false,
						drawTicks: false
					},
					ticks: {
						beginAtZero: true,
						maxTicksLimit: 11,
						stepSize: 1,
						min: 0,
						max: 10,
						callback: () => ""
					},
					scaleLabel: {
						display: false
					},
					type: "linear",
					id: "y-axis-dummy-grid-lines"
				},
				{
					display: false,
					ticks: {
						beginAtZero: true
					},
					type: "linear",
					id: "y-axis-1"
				}
			]
		}
	}

	return (
		<Box>
			<Box height={chartHeight}>
				<Line height={chartHeight} data={chartData} options={linesOptions} />
			</Box>
			<Box
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				px={1}
				flexWrap="wrap"
			>
				<Box flexGrow="1">
					<DefaultLabel label={defaultLabels[0]} align="left" />
				</Box>

				<Box flexGrow="1">
					<Typography component="div" variant="caption" align="center">
						{t(xLabel || "TIMEFRAME")}
					</Typography>
				</Box>

				<Box flexGrow="1">
					<DefaultLabel label={defaultLabels[1]} align="right" />
				</Box>
			</Box>
		</Box>
	)
}
