import React from "react"
import { Box } from "@material-ui/core"
import LinearProgress from "@material-ui/core/LinearProgress"
import { CardRow } from "./cardCommon"

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
					color="text.main"
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
					color="text.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 16 : 13}
					text={extra}
					infoText={extraInfo}
				/>
			)}

			{moreExtra && (
				<CardRow
					color="text.main"
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
