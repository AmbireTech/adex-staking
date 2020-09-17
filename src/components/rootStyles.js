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
			backgroundColor: theme.palette.background.default
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
				paddingLeft: theme.spacing(1),
				paddingRight: theme.spacing(1)
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
		}
	}
}
