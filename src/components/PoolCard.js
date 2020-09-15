import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, Button, CircularProgress, Typography } from "@material-ui/core"
import { CardRow } from "./cardCommon"

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "100%",
			position: "absolute",
			width: 69,
			height: 69,
			top: -26,
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center"
		},
		overlay: {
			position: "absolute",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: theme.palette.overlay
		},
		loading: {
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0
		}
	}
})

export default function PoolCard({
	icon,
	name,
	totalStakedADX,
	currentAPY,
	weeklyYield,
	onStakeBtnClick,
	loading,
	disabled,
	loaded,
	actions
}) {
	const classes = useStyles()

	return (
		<Box
			bgcolor={"background.paper"}
			p={4}
			pt={7}
			width={320}
			display="flex"
			flexDirection="column"
			alignItems="center"
			position="relative"
		>
			<Box mb={3}>
				<Typography variant="h4" color="textPrimary">
					{name}
				</Typography>
			</Box>

			<CardRow
				color="text.secondary"
				fontWeight={"fontWeightRegular"}
				fontSize={14}
				text={"Total Staked"}
				infoText={"Total Staked"}
			/>

			<CardRow
				color="warning.main"
				fontWeight={"fontWeightBold"}
				fontSize={20}
				text={totalStakedADX}
				infoText={totalStakedADX}
			/>

			<CardRow
				color="text.secondary"
				fontWeight={"fontWeightBold"}
				fontSize={14}
				text={totalStakedADX}
				infoText={totalStakedADX}
				mb={3}
			/>

			<CardRow
				color="text.primary"
				fontWeight={"fontWeightRegular"}
				fontSize={14}
				text={"Current annual yield (APY)"}
				infoText={"Current annual yield (APY)"}
			/>

			<CardRow
				color="warning.main"
				fontWeight={"fontWeightBold"}
				fontSize={20}
				text={currentAPY}
				infoText={currentAPY}
			/>

			<CardRow
				color="text.secondary"
				fontWeight={"fontWeightBold"}
				fontSize={14}
				text={`Weekly yield ${weeklyYield}`}
				infoText={"Current annual yield (APY)"}
				mb={3}
			/>

			<Button
				fullWidth
				variant="contained"
				disableElevation
				color="secondary"
				onClick={onStakeBtnClick}
				disabled={disabled}
			>
				{"Stake"}
			</Button>

			{!!loading && (
				<Box
					classes={{ root: classes.overlay }}
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
				>
					<Typography align="center" component="div" variant="h3"></Typography>
				</Box>
			)}

			<Box classes={{ root: classes.iconBox }}>
				{icon || null}
				{!!loading && (
					<CircularProgress
						classes={{ root: classes.loading }}
						size={69}
						color="secondary"
					/>
				)}
			</Box>
		</Box>
	)
}
