import React from "react"
import { LinearProgress, Box } from "@material-ui/core"
import logo from "./../resources/staking-logo.svg"

export default function Loading() {
	return (
		<Box
			display="flex"
			width="100vw"
			height="100vh"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
		>
			<Box mb={1}>
				<img width="200px" src={logo} alt="adex-staking-logo"></img>
			</Box>
			<Box width={200}>
				<LinearProgress color="secondary" />
			</Box>
		</Box>
	)
}
