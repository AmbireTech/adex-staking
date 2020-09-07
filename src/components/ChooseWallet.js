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
import { Wallets, WALLET_CONNECT } from "../helpers/constants"

export default function ChooseWalletDialog({
	title = "Select Wallet",
	handleListItemClick,
	handleClose,
	open,
	disableWalletConnect
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
					<ListItem
						disabled={disableWalletConnect && name === WALLET_CONNECT}
						button
						onClick={() => handleListItemClick(name)}
						key={name}
					>
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
