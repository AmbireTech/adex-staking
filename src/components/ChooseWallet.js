import React from "react"
import {
	Dialog,
	DialogTitle,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Avatar
} from "@material-ui/core"
import { Wallets } from "../helpers/constants"

export default function ChooseWalletDialog({
	title = "Select Wallet",
	content,
	handleListItemClick,
	handleClose,
	open
}) {
	return (
		<Dialog
			onClose={handleClose}
			aria-labelledby="simple-dialog-title"
			open={open}
		>
			<DialogTitle id="simple-dialog-title">{title}</DialogTitle>
			<List>
				{Wallets.map(({ icon, name, title }) => (
					<ListItem button onClick={() => handleListItemClick(name)} key={name}>
						<ListItemAvatar>
							<Avatar src={icon} />
						</ListItemAvatar>
						<ListItemText primary={title} />
					</ListItem>
				))}
			</List>
		</Dialog>
	)
}
