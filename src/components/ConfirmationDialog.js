import React from "react"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button
} from "@material-ui/core"
import { toIdAttributeString } from "../helpers/formatting"

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
				<Button
					id={`confirmation-dialog-deny-${toIdAttributeString(
						confirmActionName
					)}`}
					onClick={onDeny}
					color="primary"
				>
					Cancel
				</Button>
				<Button
					id={`confirmation-dialog-confirm-${toIdAttributeString(
						confirmActionName
					)}`}
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
