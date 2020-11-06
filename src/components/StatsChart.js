import React from "react"
import { Line } from "react-chartjs-2"
import { SECONDARY } from "../themeMUi"
import { Box, Typography, CircularProgress } from "@material-ui/core"
import { hexToRgbaColorString } from "../helpers/colors"
import { useWindowSize } from "../hooks/windowSize"
import { formatNumberPretty } from "../helpers/formatting"

const commonDsProps = {
	fill: true,
	lineTension: 0.333,
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
	xLabel = "",
	yLabel = "DATA",
	yColor = SECONDARY,
	currency,
	xSelect
}) => {
	const windowSize = useWindowSize()
	const chartHeight = Math.min(
		Math.max(Math.floor((windowSize.height || 0) / 2.2), 240),
		333
	)

	const chartData = {
		labels: dataSynced ? data.labels : defaultLabels,
		datasets: [
			{
				...commonDsProps,
				backgroundColor: hexToRgbaColorString(yColor, 0.13),
				borderColor: hexToRgbaColorString(yColor, 1),
				pointBackgroundColor: hexToRgbaColorString(yColor, 1),
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
					display: false,
					gridLines: {
						display: true,
						drawBorder: true,
						drawTicks: true,
						color: SECONDARY
					},
					scaleLabel: {
						display: false,
						labelString: xLabel,
						fontSize: DEFAULT_FONT_SIZE,
						fontFamily: FONT,
						color: SECONDARY
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
					display: false,
					gridLines: {
						display: false,
						drawBorder: false,
						drawTicks: false
					},
					ticks: {
						display: false,
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
					display: true,
					color: SECONDARY,
					ticks: {
						display: true,
						beginAtZero: true,
						fontColor: yColor,
						callback: label =>
							formatNumberPretty(label) + (currency ? ` ${currency}` : "")
					},
					scaleLabel: {
						display: true,
						color: SECONDARY
					},
					gridLines: {
						display: false
					},
					type: "linear",
					id: "y-axis-1"
				}
			]
		}
	}

	return (
		<Box width={1}>
			<Box height={chartHeight} width={1} color={yColor}>
				{dataSynced ? (
					<Line height={chartHeight} data={chartData} options={linesOptions} />
				) : (
					<Box
						width={1}
						height={1}
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						<CircularProgress color="inherit" size={chartHeight / 4} />
					</Box>
				)}
			</Box>
			<Box
				maxWidth={1}
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

				<Box flexGrow="1">{xSelect}</Box>

				<Box flexGrow="1">
					<DefaultLabel label={defaultLabels[1]} align="right" />
				</Box>
			</Box>
		</Box>
	)
}
