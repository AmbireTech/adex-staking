import React from "react"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { themeMUI } from "./themeMUi"
import { BrowserRouter as Router } from "react-router-dom"
import Root from "./Root"

const App = () => (
	<MuiThemeProvider theme={themeMUI}>
		<Router>
			<Root />
		</Router>
	</MuiThemeProvider>
)

export default App
