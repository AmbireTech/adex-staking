import React from "react"
import { Box, Divider } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"

export default function StatsCard({ title, subtitle, extra, loaded, actions }) {
	return (
		<Box elevation={3} style={{ height: "100%" }}>
			<Typography variant="caption" display="block">
				{title}
			</Typography>

			<Typography color="textSecondary" variant="subtitle2">
				{subtitle} {extra}
			</Typography>
			{actions || <></>}

			{!loaded ? <LinearProgress /> : <></>}
		</Box>
	)
}
