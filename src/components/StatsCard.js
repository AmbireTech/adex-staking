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
					fontSize={size === "large" ? 18 : 15}
					text={title}
					isAmountText
					infoText={titleInfo}
				/>
			)}

			{subtitle && (
				<CardRow
					color="warning.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 21 : 17}
					text={subtitle}
					isAmountText
					infoText={subtitleInfo}
				/>
			)}

			{extra && (
				<CardRow
					color="text.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 18 : 15}
					text={extra}
					isAmountText
					infoText={extraInfo}
				/>
			)}

			{moreExtra && (
				<CardRow
					color="warning.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 18 : 15}
					text={moreExtra}
					isAmountText
					infoText={moreExtraInfo}
				/>
			)}

			{actions || <></>}

			{!loaded ? <LinearProgress /> : <></>}
		</Box>
	)
}
