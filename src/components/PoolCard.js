import React from "react"
import { Box } from "@material-ui/core"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"
import { CardRow } from "./cardCommon"

export default function PoolCard({
	icon,
	name,
	totalStakedADX,
	currentAPY,
	weeklyYield,
	onStakeBtnClick,
	loaded,
	actions
}) {
	return (
		<Box bgcolor={"background.paper"}>
			{icon || null}
			<Typography variant="h2">{name}</Typography>

			<CardRow
				color="text.secondary"
				fontWeight={"fontWeightRegular"}
				fontSize={13}
				text={"Total Staked"}
				infoText={"Total Staked"}
			/>

			<CardRow
				color="warning.main"
				fontWeight={"fontWeightBold"}
				fontSize={19}
				text={totalStakedADX}
				infoText={totalStakedADX}
			/>

			<CardRow
				color="text.secondary"
				fontWeight={"fontWeightRegular"}
				fontSize={13}
				text={totalStakedADX}
				infoText={totalStakedADX}
				mb={2}
			/>

			<CardRow
				color="text.primary"
				fontWeight={"fontWeightRegular"}
				fontSize={13}
				text={"Current annual yield (APY)"}
				infoText={"Current annual yield (APY)"}
			/>

			<CardRow
				color="warning.main"
				fontWeight={"fontWeightBold"}
				fontSize={19}
				text={currentAPY}
				infoText={currentAPY}
			/>

			<CardRow
				color="text.secondary"
				fontWeight={"fontWeightRegular"}
				fontSize={13}
				text={`Weekly yield ${weeklyYield}`}
				infoText={"Current annual yield (APY)"}
			/>
		</Box>
	)
}
