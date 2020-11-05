import React, { useState } from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { darkTheme, lightTheme } from "./themeMUi"

export const MultiThemeContext = React.createContext()

const MultiThemeProvider = ({ children }) => {
	const [themeType, setThemeType] = useState("dark")
	const [theme, setTheme] = useState(darkTheme)

	const switchTheme = () => {
		if (themeType === "light") {
			setThemeType("dark")
			setTheme(darkTheme)
		} else {
			setThemeType("light")
			setTheme(lightTheme)
		}
	}

	const contextValue = {
		themeType,
		switchTheme
	}

	return (
		<MultiThemeContext.Provider value={contextValue}>
			<MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
		</MultiThemeContext.Provider>
	)
}

export default MultiThemeProvider
