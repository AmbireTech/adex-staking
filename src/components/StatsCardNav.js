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
	actions,
	multilineLinesAmounts,
	justify
}) {
	return (
		<Box>
			{title && (
				<CardRow
					color="sideNav.text.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 20 : 15}
					text={title}
					isAmountText
					infoText={titleInfo}
					justify={justify}
					decimalOpacity="0.97"
				/>
			)}

			{subtitle && (
				<CardRow
					color="sideNav.special.main"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 21 : 17}
					text={subtitle}
					isAmountText
					decimalFontSize={size === "large" ? 30 : 20}
					multilineLinesAmounts={multilineLinesAmounts}
					infoText={subtitleInfo}
					justify={justify}
					decimalOpacity="0.97"
				/>
			)}

			{extra && (
				<CardRow
					color="sideNav.special.contrastText"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 20 : 15}
					text={extra}
					isAmountText
					infoText={extraInfo}
					justify={justify}
					decimalOpacity="0.97"
				/>
			)}

			{moreExtra && (
				<CardRow
					color="special.primary"
					fontWeight={size === "large" ? "fontWeightBold" : "fontWeightRegular"}
					fontSize={size === "large" ? 20 : 15}
					text={moreExtra}
					isAmountText
					infoText={moreExtraInfo}
					justify={justify}
					decimalOpacity="0.97"
				/>
			)}

			{actions || <></>}

			{!loaded ? <LinearProgress /> : <></>}
		</Box>
	)
}
