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
export const BACKGROUND_SPECIAL = "#4e3db3"

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
		default: BLACK,
		special: BACKGROUND_SPECIAL
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

const shadows = [
	"none",
	"0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
	"0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
	"0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
	"0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
	"0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)",
	"0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
	"0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)",
	"0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
	"0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)",
	"0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
	"0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)",
	"0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)",
	"0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)",
	"0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)",
	"0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)",
	"0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)",
	"0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)",
	"0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)",
	"0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)",
	"0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)",
	"0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)",
	"0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)",
	"0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)",
	"0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)",
	"3px 4px 15px 0px rgba(0,0,0,1)"
]

const defaultTheme = createMuiTheme({ typography, palette })

const theme = createMuiTheme({
	shadows,
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
				backgroundColor: fade(DARKER_PAPER, 0.9),
				padding: defaultTheme.spacing(2)
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
				maxWidth: "100%",
				alignItems: "center"
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
