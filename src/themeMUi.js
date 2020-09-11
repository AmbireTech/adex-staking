import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles"
import lime from "@material-ui/core/colors/lime"
import deepOrange from "@material-ui/core/colors/deepOrange"
import amber from "@material-ui/core/colors/amber"
import { fade } from "@material-ui/core/styles/colorManipulator"

const WHITE = "#fff"
const BLACK = "#000"
export const PRIMARY = "#494560"
export const SECONDARY = "#ff4269"
export const ALEX_GREY = "#3f3e3e"
export const ALEX_GREY_LIGHT = "#666"
export const ACCENT_ONE = "#57467B"
export const ACCENT_TWO = "#7CB4B8"
export const TEXT_PRIMARY = "#7B7597"
export const TEXT_SECONDARY = "#3314443D"

const palette = {
	primary: { main: PRIMARY, contrastText: WHITE },
	secondary: { main: SECONDARY, contrastText: WHITE },
	accentOne: { main: ACCENT_ONE, contrastText: WHITE },
	accentTwo: { main: ACCENT_TWO, contrastText: WHITE },
	grey: { main: ALEX_GREY, contrastText: WHITE },
	error: deepOrange,
	warning: amber,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	text: {
		primary: fade(WHITE, 0.69),
		secondary: fade(WHITE, 0.42),
		disabled: fade(WHITE, 0.333),
		hint: fade(WHITE, 0.333)
	},
	divider: fade(WHITE, 0.12),
	background: {
		paper: "#29253B",
		default: BLACK
	}
}

const theme = createMuiTheme({
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		fontSize: 14
	},
	palette: { ...palette },
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0
			},
			outlined: {
				borderRadius: 0,
				borderColor: ALEX_GREY
			},
			contained: {
				backgroundColor: ALEX_GREY,
				color: WHITE,
				boxShadow: 0,
				"&:hover": {
					backgroundColor: ALEX_GREY_LIGHT,
					boxShadow: 0,
					"@media (hover: none)": {
						boxShadow: 0
					}
				},
				"&$focusVisible": {
					boxShadow: 0,
					backgroundColor: ALEX_GREY_LIGHT
				},
				"&:active": {
					backgroundColor: ALEX_GREY_LIGHT,
					boxShadow: 0
				},
				"&:disabled": {
					backgroundColor: fade(WHITE, 0.12),
					color: fade(WHITE, 0.26)
				}
			}
		},
		MuiFab: {
			root: {
				boxShadow: 0,
				"&:disabled": {
					backgroundColor: fade(WHITE, 0.12),
					color: fade(WHITE, 0.26)
				}
			}
		},
		MuiTableCell: {
			head: {
				whiteSpace: "nowrap"
			},
			root: {
				whiteSpace: "nowrap"
			}
		},
		MuiPaper: {
			rounded: {
				borderRadius: 0
			}
		},
		MuiTooltip: {
			tooltip: {
				borderRadius: 0,
				fontSize: "0.9em",
				backgroundColor: `rgba(0,0,0, 0.69)`
			},
			arrow: { color: `rgba(0,0,0, 0.69)` }
		},
		MuiDrawer: {
			paperAnchorLeft: {
				borderRight: 0
			},
			paperAnchorDockedLeft: {
				borderRight: 0
			}
		}
	}
})

export const themeMUI = responsiveFontSizes(theme, {
	options: ["xs", "sm", "md", "lg", "xl"],
	factor: 3
})
