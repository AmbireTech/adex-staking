import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles"
import lime from "@material-ui/core/colors/lime"
import deepOrange from "@material-ui/core/colors/deepOrange"
import { fade } from "@material-ui/core/styles/colorManipulator"

const WHITE = "#fff"
const BLACK = "#000"
export const PRIMARY = "#494560"
export const SECONDARY = "#ff4269"
export const ALEX_GREY = "#3f3e3e"
export const ALEX_GREY_LIGHT = "#666"
export const WARNING = "#FEB006"
export const WARNING_LIGHT = "#ffe24d"
export const WARNING_DARK = "#c58100"
export const TEXT_PRIMARY = "#7B7597"
export const TEXT_SECONDARY = "#3314443D"
export const PAPER = "#29253B"
export const DARKER_PAPER = "#1A1825"

const palette = {
	primary: { main: PRIMARY, contrastText: WHITE },
	secondary: { main: SECONDARY, contrastText: WHITE },
	grey: { main: ALEX_GREY, contrastText: WHITE },
	error: deepOrange,
	warning: {
		main: WARNING,
		light: WARNING_LIGHT,
		dark: WARNING_DARK,
		contrastText: BLACK
	},
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	text: {
		primary: fade(WHITE, 0.42),
		secondary: fade(WHITE, 0.23),
		disabled: fade(WHITE, 0.13),
		hint: fade(WHITE, 0.13)
	},
	divider: fade(WHITE, 0.12),
	background: {
		darkerPaper: DARKER_PAPER,
		paper: PAPER,
		default: BLACK
	}
}

const typography = {
	fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	fontSize: 13
}

const theme = createMuiTheme({
	typography,
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
					backgroundColor: ALEX_GREY_LIGHT
				},
				"&$focusVisible": {
					backgroundColor: ALEX_GREY_LIGHT
				},
				"&:active": {
					backgroundColor: ALEX_GREY_LIGHT
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
				backgroundColor: PAPER
			},
			arrow: { color: PAPER }
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
