import React from "react"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button
} from "@material-ui/core"
import { ZERO, UNBOND_DAYS } from "../helpers/constants"
import { formatADX } from "../helpers/utils"

export default function UnbondConfirmationDialog({
	toUnbond,
	onDeny,
	onConfirm
}) {
	return (
		<Dialog open={!!toUnbond} onClose={onDeny}>
			<DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>
			<DialogContent>
				Are you sure you want to request unbonding of{" "}
				{formatADX(toUnbond ? toUnbond.currentAmount : ZERO)} ADX?
				<br />
				<br />
				Please be aware:
				<ol>
					<li>
						It will take {UNBOND_DAYS} days before you will be able to withdraw
						your ADX!
					</li>
					<li>
						You will not receive staking rewards for this amount in this{" "}
						{UNBOND_DAYS} day period.
					</li>
				</ol>
			</DialogContent>
			<DialogActions>
				<Button onClick={onDeny} autoFocus color="primary">
					Cancel
				</Button>
				<Button onClick={onConfirm} color="primary">
					Unbond
				</Button>
			</DialogActions>
		</Dialog>
	)
}
