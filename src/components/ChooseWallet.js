import React from "react"
import {
	Dialog,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
	Avatar,
	ListItemIcon
} from "@material-ui/core"
import { Wallets, METAMASK } from "../helpers/constants"
import { toIdAttributeString } from "../helpers/formatting"
import { useTranslation } from "react-i18next"

export default function ChooseWallet({
	handleListItemClick,
	handleClose,
	open,
	disableNonBrowserWallets
}) {
	const { t } = useTranslation()

	return (
		<Dialog
			onClose={handleClose}
			aria-labelledby="simple-dialog-title"
			open={open}
		>
			<DialogTitle id="simple-dialog-title">
				{t("dialogs.selectWallet")}
			</DialogTitle>
			<List>
				{Wallets.map(({ icon, icons, name = "", extraLabel }) => (
					<ListItem
						id={`connect-wallet-select-${toIdAttributeString(name)}`}
						disabled={disableNonBrowserWallets && name !== METAMASK}
						button
						onClick={() => handleListItemClick(name)}
						key={name}
					>
						<ListItemIcon style={{ paddingLeft: 20 }}>
							{(icons || [icon]).map((icn, i) => (
								<Avatar
									variant="circle"
									key={i}
									src={icn}
									style={{
										marginLeft: -25,
										backgroundColor: "white",
										border: "1px solid rgb(157 176 238)"
									}}
								/>
							))}
						</ListItemIcon>
						<ListItemText
							primary={t("dialogs.connectWith", {
								wallet: name
							})}
							secondary={
								extraLabel
									? t(extraLabel.message || "", extraLabel.data || {})
									: null
							}
						/>
					</ListItem>
				))}
			</List>
		</Dialog>
	)
}
