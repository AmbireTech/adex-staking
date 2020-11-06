import React, { useContext } from "react"
import { LinearProgress, Box } from "@material-ui/core"
import logo from "../resources/staking-logo.svg"
import logoLight from "../resources/logo-light-theme.svg"
import { MultiThemeContext } from "../MultiThemeProvider"

export default function Loading() {
	const { themeType } = useContext(MultiThemeContext)

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
				<img
					width="200px"
					src={themeType === "dark" ? logo : logoLight}
					// src={logo}
					alt="adex-staking-logo"
				></img>
			</Box>
			<Box width={200}>
				<LinearProgress color="secondary" />
			</Box>
		</Box>
	)
}
