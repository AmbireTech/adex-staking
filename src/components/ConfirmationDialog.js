import React from "react"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button
} from "@material-ui/core"
import { toIdAttributeString } from "../helpers/formatting"
import { useTranslation } from "react-i18next"

export default function ConfirmationDialog({
	isOpen,
	onDeny,
	onConfirm,
	content,
	title,
	confirmActionName
}) {
	const { t } = useTranslation()

	return (
		<Dialog open={isOpen} onClose={onDeny}>
			<DialogTitle id="alert-dialog-title">
				{title || t("common.areYouSure")}
			</DialogTitle>
			<DialogContent>{content}</DialogContent>
			<DialogActions>
				<Button
					id={`confirmation-dialog-deny-${toIdAttributeString(
						confirmActionName
					)}`}
					onClick={onDeny}
					color="primary"
				>
					{t("common.cancel")}
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
