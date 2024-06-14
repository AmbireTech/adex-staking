import React from "react"
import { Box } from "@material-ui/core"
import LinearProgress from "@material-ui/core/LinearProgress"
import { CardRow } from "./cardCommon"

export default function StatsCard({
	size,
	title,
	titleInfo,
	subtitle,
	subtitleLarge,
	subtitleInfo,
	extra,
	extraInfo,
	moreExtra,
	moreExtraInfo,
	loaded,
	actions,
	multilineLinesAmounts,
	justify
}) {
	return (
		<Box>
			{title && (
				<CardRow
					color="text.special"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 18 : 15}
					text={title}
					isAmountText
					infoText={titleInfo}
					justify={justify}
				/>
			)}

			{subtitle && (
				<CardRow
					color="text.secondaryLight"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 21 : 17}
					text={subtitle}
					isAmountText
					multilineLinesAmounts={multilineLinesAmounts}
					infoText={subtitleInfo}
					justify={justify}
				/>
			)}
			{subtitleLarge && (
				<CardRow
					color="text.secondaryLight"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 21 : 17}
					text={subtitle}
					isAmountText
					multilineLinesAmounts={multilineLinesAmounts}
					infoText={subtitleInfo}
					justify={justify}
				/>
			)}

			{extra && (
				<CardRow
					color="special.contrastText"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 18 : 15}
					text={extra}
					isAmountText
					infoText={extraInfo}
					justify={justify}
				/>
			)}

			{moreExtra && (
				<CardRow
					color="special.primary"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 18 : 15}
					text={moreExtra}
					isAmountText
					infoText={moreExtraInfo}
					justify={justify}
				/>
			)}

			{actions || <></>}

			{!loaded ? <LinearProgress /> : <></>}
		</Box>
	)
}
