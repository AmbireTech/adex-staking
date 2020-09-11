import React from "react"
import { Box, Tooltip } from "@material-ui/core"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"
import { InfoSharp as InfoIcon } from "@material-ui/icons"

function Info({ title, color, icon }) {
	return (
		<Tooltip title={title}>
			<InfoIcon fontSize="inherit" />
		</Tooltip>
	)
}

function CardRow({ text, infoText, fontWeight, fontSize, color }) {
	return (
		<Typography component="div" variant="body2">
			<Box
				color={color}
				fontWeight={fontWeight}
				fontSize={fontSize}
				display="flex"
				flexDirection="row"
				alignItems="center"
			>
				<Box>{text}</Box>
				{infoText && (
					<Box
						ml={0.69}
						display="flex"
						// flexDirection='row'
						// alignItems='center'
					>
						<Info title={infoText} />
					</Box>
				)}
			</Box>
		</Typography>
	)
}

export default function StatsCard({
	size,
	title,
	titleInfo,
	subtitle,
	subtitleInfo,
	extra,
	extraInfo,
	moreExtra,
	moreExtraInfo,
	loaded,
	actions
}) {
	return (
		<Box>
			{title && (
				<CardRow
					color="text.primary"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 16 : 13}
					text={title}
					infoText={titleInfo}
				/>
			)}

			{subtitle && (
				<CardRow
					color="warning.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 19 : 15}
					text={subtitle}
					infoText={subtitleInfo}
				/>
			)}

			{extra && (
				<CardRow
					color="text.primary"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 16 : 13}
					text={extra}
					infoText={extraInfo}
				/>
			)}

			{moreExtra && (
				<CardRow
					color="text.primary"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 16 : 13}
					text={moreExtra}
					infoText={moreExtraInfo}
				/>
			)}

			{actions || <></>}

			{!loaded ? <LinearProgress /> : <></>}
		</Box>
	)
}
