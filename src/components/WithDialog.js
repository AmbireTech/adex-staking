import React, { Fragment, useState, forwardRef } from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@material-ui/core/styles"
import {
	Button,
	Box,
	Fab,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	Slide,
	DialogActions,
	Typography
} from "@material-ui/core"
import clsx from "clsx"
import { withStyles } from "@material-ui/core/styles"
import CancelIcon from "@material-ui/icons/Cancel"
import Tooltip from "./Tooltip"

export const styles = theme => {
	const spacing = theme.spacing(2)
	return {
		dialog: {
			// height: `calc(100vh - ${spacing}px)`,
			// minWidth: 999,
			// maxWidth: 999,
			backgroundColor: theme.palette.background.paper
			// "@media(max-width:1080px)": {
			// 	maxWidth: "100%",
			// 	minWidth: `calc(100vw - ${spacing}px)`
			// }
		},
		dialogTitle: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			wordWrap: "break-word",
			margin: spacing,
			marginLeft: theme.spacing(2),
			marginBottom: 0,
			padding: 0
		},
		content: {
			display: "flex",
			flexDirection: "column",
			flex: "1 1 auto",
			position: "relative",
			padding: spacing,
			margin: 0,
			overflowX: "visible",
			overflowY: "auto"
		},
		textBtn: {
			cursor: "pointer"
		},
		btnIconLeft: {
			marginRight: theme.spacing(1)
		},
		breakLong: {
			wordBreak: "break-word",
			overflowWrap: "break-word",
			hyphens: "auto"
		}
	}
}

const textBtn = ({ label, className, classes, style, onClick, ...rest }) => {
	return (
		<span
			className={clsx(classes.textBtn, className)}
			style={style}
			onClick={onClick}
		>
			{" "}
			{label}{" "}
		</span>
	)
}

const TextBtn = withStyles(styles)(textBtn)

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />
})

const useStyles = makeStyles(styles)

export default function WithDialogHoc(Decorated) {
	function WithDialog(props) {
		const {
			id,
			disableBackdropClick = false,
			forwardedRef,
			iconButton,
			textButton,
			fabButton,
			variant,
			color,
			size,
			mini,
			btnLabel,
			disabled,
			className,
			icon,
			title,
			dialogActions,
			onClick,
			fullWidth,
			onBeforeOpen,
			onCloseDialog,
			tooltipTitle,
			...rest
		} = props

		const btnProps = {
			color,
			size,
			variant
		}

		const classes = useStyles()
		const [open, setOpen] = useState(false)

		const handleToggle = async () => {
			if (typeof onBeforeOpen === "function" && !open) {
				await onBeforeOpen()
			}

			setOpen(!open)
		}

		const handleClick = async ev => {
			ev && ev.stopPropagation && ev.stopPropagation()
			ev && ev.preventDefault && ev.preventDefault()
			await handleToggle()
			if (onClick) await onClick()
		}

		const closeDialog = () => {
			if (onCloseDialog) {
				onCloseDialog()
			}

			setOpen(false)
		}

		let ButtonComponent = null

		if (iconButton) {
			ButtonComponent = IconButton
		} else if (textButton) {
			ButtonComponent = TextBtn
		} else if (fabButton) {
			ButtonComponent = Fab
		} else {
			ButtonComponent = Button
			btnProps.fullWidth = fullWidth
		}
		return (
			<Fragment>
				<Tooltip title={tooltipTitle || ""}>
					<Box
						display="inline-block"
						{...(btnProps.fullWidth ? { width: 1 } : {})}
					>
						<ButtonComponent
							id={id}
							disabled={disabled}
							aria-label={btnLabel || ""}
							label={btnLabel || ""}
							onClick={ev => handleClick(ev)}
							{...btnProps}
							className={clsx(
								className,
								{ [classes.floating]: !!fabButton },
								{ [classes.first]: color === "first" },
								{ [classes.second]: color === "second" }
							)}
						>
							{icon}
							{(!iconButton && btnLabel) || ""}
						</ButtonComponent>
					</Box>
				</Tooltip>
				<Dialog
					// disableBackdropClick={disableBackdropClick}
					// disableEscapeKeyDown
					// maxWidth="xs"
					// fullScreen
					open={open}
					onClose={handleToggle}
					TransitionComponent={Transition}
					classes={{ paper: classes.dialog }}
					// onEscKeyDown={handleToggle}
					// onOverlayClick={handleToggle}
				>
					<DialogTitle
						disableTypography
						classes={{
							root: clsx(classes.dialogTitle, classes.breakLong)
						}}
					>
						<Typography variant="h4">{title}</Typography>
						<IconButton onClick={handleToggle} size="small">
							<CancelIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent classes={{ root: classes.content }}>
						<Decorated ref={forwardedRef} {...rest} closeDialog={closeDialog} />
					</DialogContent>
					{dialogActions && <DialogActions>{dialogActions}</DialogActions>}
				</Dialog>
			</Fragment>
		)
	}

	WithDialog.propTypes = {
		btnLabel: PropTypes.string,
		title: PropTypes.string.isRequired,
		floating: PropTypes.bool,
		onBeforeOpen: PropTypes.func
	}

	return forwardRef((props, ref) => (
		<WithDialog {...props} forwardedRef={ref} />
	))
}
