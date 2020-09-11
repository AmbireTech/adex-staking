import React from "react"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button
} from "@material-ui/core"

export default function ConfirmationDialog({
	isOpen,
	onDeny,
	onConfirm,
	content,
	title = "Are you sure?",
	confirmActionName
}) {
	return (
		<Dialog open={isOpen} onClose={onDeny}>
			<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
			<DialogContent>{content}</DialogContent>
			<DialogActions>
				<Button onClick={onDeny} color="primary">
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="primary"
					disableElevation
				>
					{confirmActionName}
				</Button>
			</DialogActions>
		</Dialog>
	)
}
