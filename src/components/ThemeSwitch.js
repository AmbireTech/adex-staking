import React, { useContext } from "react"
import { IconButton } from "@material-ui/core"
import {
	Brightness7Sharp as LightIcon,
	Brightness6Sharp as DarkIcon
} from "@material-ui/icons"
import { MultiThemeContext } from "../MultiThemeProvider"

export default function ThemeSwitch() {
	const { themeType, switchTheme } = useContext(MultiThemeContext)

	return (
		<IconButton onClick={switchTheme}>
			{themeType === "dark" ? <LightIcon /> : <DarkIcon />}
		</IconButton>
	)
}
