import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles"
import lime from "@material-ui/core/colors/lime"
import { fade } from "@material-ui/core/styles/colorManipulator"

const WHITE = "#fafafa"
const BLACK = "#0f0f0f"
export const PRIMARY = "#494560"
export const SECONDARY = "#ff4269"
export const ALEX_GREY = "#3f3e3e"
export const ALEX_GREY_LIGHT = "#666"
export const WARNING = "#FEB006"
export const SUCCESS = "#14dc9c"
export const INFO = "#1b75bc"
export const ERROR = "#ff6969"
export const TEXT_SECONDARY = "#3314443D"
export const TEXT_MAIN = "#7B7597"
export const PAPER = "#29253B"
export const DARKER_PAPER = "#1A1825"
export const BACKGROUND_DEFAULT = "#131313"

const palette = {
	type: "dark",
	primary: { main: PRIMARY, contrastText: WHITE },
	secondary: { main: SECONDARY, contrastText: WHITE },
	grey: { main: ALEX_GREY, contrastText: WHITE },
	warning: {
		main: WARNING,
		contrastText: BLACK
	},
	success: {
		main: SUCCESS,
		contrastText: BLACK
	},
	info: {
		main: INFO,
		contrastText: WHITE
	},
	error: {
		main: ERROR,
		contrastText: WHITE
	},
	first: lime,
	text: {
		main: TEXT_MAIN,
		primary: fade(WHITE, 0.69),
		secondary: fade(WHITE, 0.42),
		disabled: fade(WHITE, 0.1948),
		hint: fade(WHITE, 0.13)
	},
	divider: fade(WHITE, 0.13),
	background: {
		darkerPaper: DARKER_PAPER,
		paper: PAPER,
		default: BLACK
	},
	overlay: fade(DARKER_PAPER, 0.69),
	action: {
		action: fade(WHITE, 0.46),
		hover: fade(WHITE, 0.069),
		hoverOpacity: 0.069,
		selected: fade(WHITE, 0.1914),
		selectedOpacity: 0.1914,
		disabled: fade(WHITE, 0.1948),
		disabledOpacity: 0.48,
		focus: fade(WHITE, 0.18),
		focusOpacity: 0.18,
		activatedOpacity: 0.18
	},
	common: {
		white: WHITE,
		black: BLACK
	}
}

const typography = {
	fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	fontSize: 14.2
}

const defaultTheme = createMuiTheme({ typography, palette })

const theme = createMuiTheme({
	typography,
	palette,
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
				},
				"&:active": {
					boxShadow: 0
				},
				"&$focusVisible": {
					boxShadow: 0
				},
				"&$disabled": {
					boxShadow: 0
				}
			}
		},
		MuiTableCell: {
			head: {
				whiteSpace: "nowrap",
				color: defaultTheme.palette.text.main
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
				backgroundColor: fade(DARKER_PAPER, 0.9)
			},
			arrow: { color: fade(DARKER_PAPER, 0.9) }
		},
		MuiDrawer: {
			paperAnchorLeft: {
				borderRight: 0
			},
			paperAnchorDockedLeft: {
				borderRight: 0
			}
		},
		MuiAlert: {
			root: {
				borderRadius: 0,
				maxWidth: "100%"
			},
			message: {
				wordBreak: "break-word"
			},
			outlinedSuccess: {
				backgroundColor: BLACK
			},
			outlinedInfo: {
				backgroundColor: BLACK
			},
			outlinedWarning: {
				backgroundColor: BLACK
			},
			outlinedError: {
				backgroundColor: WHITE
			},
			filledSuccess: {
				color: defaultTheme.palette.success.contrastText
			},
			filledInfo: {
				color: defaultTheme.palette.info.contrastText
			},
			filledWarning: {
				color: defaultTheme.palette.warning.contrastText
			},
			filledError: {
				color: defaultTheme.palette.error.contrastText
			}
		},
		MuiBackdrop: {
			root: {
				backgroundColor: fade(BLACK, 0.69)
			}
		}
		// MuiDrawer: {
		// 	root: {
		// 		top: 0,
		// 		left: 0,
		// 		bottom: 'auto',
		// 		right: 'auto',
		// 		width: '100vw',
		// 		height: '100vh',
		// 		position: 'fixed'
		// 	},
		// 	paper: {
		// 		top: 0,
		// 		left: 0,
		// 		height: '100%',
		// 		position: 'absolute'
		// 	}
		// }
	}
})

export const themeMUI = responsiveFontSizes(theme, {
	breakpoints: ["xs", "sm", "md", "lg", "xl"],
	factor: 3
})
