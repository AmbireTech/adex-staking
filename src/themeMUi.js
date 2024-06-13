import { createTheme, responsiveFontSizes } from "@material-ui/core/styles"
import lime from "@material-ui/core/colors/lime"
import { alpha } from "@material-ui/core/styles/colorManipulator"

const WHITE = "#F5F6FA"
const BLACK = "#0f0f0f"
export const PRIMARY = "#494560"
export const SECONDARY = "#2C5CDE"
export const ACCENT = "#FF6A42"
export const ALEX_GREY = "#3f3e3e"
export const ALEX_GREY_LIGHT = "#666"
export const WARNING = "#FEB006"
export const SUCCESS = "#0CB07B"
export const INFO = "#1b75bc"
export const ERROR = "#ff6969"

// DARK THEME
export const TEXT_MAIN = "#959EB8"
export const TEXT_DEFAULT = "#e2dff5"
export const PAPER = "#29253B"
export const DARKER_PAPER = "#1A1825"
export const BACKGROUND_DEFAULT = "#131313"
export const SPECIAL_CONTRAST = "#6942ff"

//LIGHT THEME
export const TEXT_SECONDARY_LIGHT = "#525C75"
export const TEXT_MAIN_LIGHT = "#212021"
export const PAPER_LIGHT = "#EBEEFA"
export const DARKER_PAPER_LIGHT = "#fcfcfc"
export const CARD_PAPER_LIGHT = "#fefefe"
export const CARD_PAPER = "#141C33"
export const BACKGROUND_DEFAULT_LIGHT = WHITE
export const SPECIAL_CONTRAST_LIGHT = "#EBEEFA" //  SECONDARY// "#3c1fcc"

const paletteCommon = {
	primary: { main: PRIMARY, contrastText: WHITE },
	secondary: { main: SECONDARY, contrastText: WHITE },
	accent: ACCENT,
	grey: { main: ALEX_GREY, contrastText: WHITE },
	lightGrey: { main: ALEX_GREY_LIGHT, contrastText: WHITE },
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
	button: {
		primary: ACCENT,
		secondary: SECONDARY
	},
	first: lime,
	common: {
		white: WHITE,
		black: BLACK,
		hint: alpha(WHITE, 0.13)
	},
	sideNav: {
		text: {
			main: TEXT_MAIN,
			primary: alpha(WHITE, 0.69),
			secondary: alpha(WHITE, 0.42)
		},
		special: { main: SPECIAL_CONTRAST_LIGHT, contrastText: "#618AF9" },
		background: {
			darkerPaper: "#141C33",
			active: PRIMARY
		},
		divider: alpha(WHITE, 0.13)
	}
}

const paletteLight = {
	type: "light",
	...paletteCommon,
	special: { main: SPECIAL_CONTRAST_LIGHT, contrastText: "#618AF9" },
	text: {
		main: TEXT_MAIN_LIGHT,
		primary: alpha(BLACK, 0.9),
		secondary: TEXT_SECONDARY_LIGHT,
		secondaryLight: alpha(TEXT_SECONDARY_LIGHT, 0.698),
		disabled: alpha(BLACK, 0.42),
		hint: alpha(BLACK, 0.13)
	},
	background: {
		default: BACKGROUND_DEFAULT_LIGHT,
		darkerPaper: PAPER_LIGHT,
		accentPaper: ACCENT,
		paper: DARKER_PAPER_LIGHT,
		special: SPECIAL_CONTRAST_LIGHT,
		specialSecondary: BLACK,
		active: alpha(TEXT_MAIN, 0.42),
		contrast: TEXT_MAIN,
		contrastText: WHITE,
		card: DARKER_PAPER_LIGHT
	}
}

const paletteDark = {
	type: "dark",
	...paletteCommon,
	...paletteLight
	// special: { main: WARNING, contrastText: BLACK },
	// text: {
	// 	main: TEXT_MAIN,
	// 	primary: alpha(WHITE, 0.69),
	// 	secondary: alpha(WHITE, 0.42),
	// 	disabled: alpha(WHITE, 0.1948),
	// 	hint: alpha(WHITE, 0.13)
	// },
	// divider: alpha(WHITE, 0.13),
	// background: {
	// 	darkerPaper: DARKER_PAPER,
	// 	paper: PAPER,
	// 	default: BLACK,
	// 	special: SPECIAL_CONTRAST,
	// 	specialSecondary: BLACK,
	// 	active: PRIMARY,
	// 	contrast: WHITE,
	// 	contrastText: BLACK,
	// 	card: PAPER
	// },
	// overlay: alpha(DARKER_PAPER, 0.69),
	// action: {
	// 	action: alpha(WHITE, 0.46),
	// 	hover: alpha(WHITE, 0.069),
	// 	hoverOpacity: 0.069,
	// 	selected: alpha(WHITE, 0.1914),
	// 	selectedOpacity: 0.1914,
	// 	disabled: alpha(WHITE, 0.1948),
	// 	disabledOpacity: 0.48,
	// 	focus: alpha(WHITE, 0.18),
	// 	focusOpacity: 0.18,
	// 	activatedOpacity: 0.18
	// }
}

const typography = {
	fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	fontSize: 14.2
}

const defaultTheme = createTheme({
	palette: { ...paletteCommon }
})

const darkShadows = [...defaultTheme.shadows, "3px 4px 15px 0px rgba(0,0,0,1)"]

const lightShadows = [
	...defaultTheme.shadows,
	"1px 1px 5px 0px rgba(69,69,69,0.30)"
]

const commonTheme = createTheme({
	...defaultTheme,
	typography,
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
				}
				// "&:disabled": {
				// 	backgroundColor: alpha(WHITE, 0.12),
				// 	color: alpha(WHITE, 0.26)
				// }
			}
		},
		MuiFab: {
			root: {
				boxShadow: 0,
				// "&:disabled": {
				// 	backgroundColor: alpha(WHITE, 0.12),
				// 	color: alpha(WHITE, 0.26)
				// },
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
				color: defaultTheme.palette.text.main,
				fontWeight: 700
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
				backgroundColor: alpha(DARKER_PAPER, 0.9),
				padding: defaultTheme.spacing(2)
			},
			arrow: { color: alpha(DARKER_PAPER, 0.9) }
		},
		MuiDrawer: {
			paperAnchorLeft: {
				borderRight: 0
			},
			paperAnchorDockedLeft: {
				borderRight: 0
			}
		},
		MuiDivider: {
			root: {
				backgroundColor: paletteCommon.sideNav.divider
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
				backgroundColor: alpha(BLACK, 0.69)
			}
		},
		MuiFilledInput: {
			root: {
				borderRadius: 0,
				borderTopLeftRadius: 0,
				borderTopRightRadius: 0
			}
		},
		MuiOutlinedInput: {
			root: {
				borderRadius: 0
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

const defaultThemeWithOverrides = responsiveFontSizes(commonTheme, {
	breakpoints: ["xs", "sm", "md", "lg", "xl"],
	factor: 3
})

export const darkTheme = createTheme({
	...defaultThemeWithOverrides,
	palette: paletteDark,
	shadows: darkShadows,
	type: "dark"
})

export const lightTheme = createTheme({
	...defaultThemeWithOverrides,
	palette: paletteLight,
	shadows: lightShadows,
	type: "light"
})
