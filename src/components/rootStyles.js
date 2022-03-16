import { alpha } from "@material-ui/core/styles/colorManipulator"

const drawerWidth = 269
const maxContentWidth = 1420

export const styles = theme => {
	return {
		root: {
			flexGrow: 1,
			overflow: "hidden",
			position: "relative",
			display: "flex",
			flexDirection: "column",
			height: "100vh",
			width: "100vw",
			backgroundColor: theme.palette.background.default,
			backgroundImage:
				theme.type === "dark"
					? `radial-gradient(
				circle,
				${alpha(theme.palette.background.special, 0.333)} 0%,
				${alpha(theme.palette.background.specialSecondary, 0.69)} 146%
			)`
					: 0,
			backgroundRepeat: "no-repeat",
			[theme.breakpoints.up("md")]: {
				backgroundPositionX: drawerWidth / 2,
				backgroundImage:
					theme.type === "dark"
						? `radial-gradient(
					circle,
					${alpha(theme.palette.background.special, 0.333)} 0%,
					${alpha(theme.palette.background.specialSecondary, 0.69)} 93%
				)`
						: 0
			}
		},
		toolbar: {
			flexWrap: "wrap",
			paddingLeft: theme.spacing(2),
			paddingRight: theme.spacing(2),
			[theme.breakpoints.up("md")]: {
				paddingLeft: theme.spacing(4),
				paddingRight: theme.spacing(4),
				marginLeft: drawerWidth
			},
			[theme.breakpoints.down("sm")]: {
				paddingLeft: theme.spacing(1.5),
				paddingRight: theme.spacing(1.5)
			}
		},
		toolbarActions: {
			maxWidth: maxContentWidth,
			margin: "auto"
		},
		drawerPaper: {
			width: drawerWidth,
			// height: '110vh',
			backgroundColor: theme.palette.background.darkerPaper
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(2),
			paddingTop: theme.spacing(2),
			overflow: "auto",
			[theme.breakpoints.up("md")]: {
				padding: theme.spacing(4),
				paddingTop: theme.spacing(4),
				marginLeft: drawerWidth
			},
			[theme.breakpoints.down("sm")]: {
				paddingLeft: theme.spacing(1),
				paddingRight: theme.spacing(1)
			}
		},
		contentInner: {
			maxWidth: maxContentWidth,
			margin: "auto",
			marginBottom: theme.spacing(2)
			// // Because of the floating button and table paging
			// [theme.breakpoints.down("sm")]: {
			// 	paddingBottom: 146 + theme.spacing(2)
			// }
		},
		modal: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		},
		alwaysOnTop: {
			zIndex: `${theme.zIndex.tooltip * 2} !important`
		},
		stickyAlerts: {
			zIndex: `${theme.zIndex.appBar}`,
			position: "sticky",
			top: 0
		}
	}
}
