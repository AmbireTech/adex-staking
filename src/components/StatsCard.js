import React from "react"
import { Paper } from "@material-ui/core"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"
import { themeMUI } from "../themeMUi"

export default function StatsCard({ title, subtitle, extra, loaded, actions }) {
	const extraElem =
		typeof extra === "string" ? (
			<Typography color="primary" variant="h6">
				{extra}
			</Typography>
		) : (
			extra || <></>
		)
	return (
		<Paper elevation={3} style={{ height: "100%" }}>
			<div style={{ padding: themeMUI.spacing(2), minHeight: "85px" }}>
				<Typography variant="h5">{subtitle}</Typography>
				{extraElem}
				<Typography color="textSecondary" variant="subtitle2">
					{title}
				</Typography>
				{actions || <></>}
			</div>
			{!loaded ? <LinearProgress /> : <></>}
		</Paper>
	)
}
