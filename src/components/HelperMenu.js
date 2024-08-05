import React, { useState } from "react"
import { Button, Menu, Link, MenuItem } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { ReactComponent as HelpIcon } from "./../resources/info.svg"

export const Help = () => {
	const { t } = useTranslation()
	const [menuEl, setMenuEl] = useState(null)
	const openHelpMenu = ev => {
		setMenuEl(ev.currentTarget)
	}
	const closeHelpMenu = () => {
		setMenuEl(null)
	}
	return (
		<>
			<Button
				id="help-menu-btn"
				size="large"
				style={{ textTransform: "capitalize" }}
				startIcon={<HelpIcon size="large" />}
				onClick={openHelpMenu}
			>
				{t("help.help")}
			</Button>
			<Menu
				id="help-menu-menu"
				anchorEl={menuEl}
				open={Boolean(menuEl)}
				keepMounted
				onClose={closeHelpMenu}
				getContentAnchorEl={null}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				transformOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Link
					id="help-menu-external-link-adex-network-tos"
					color="inherit"
					href="https://www.adex.network/tos"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>{t("common.tos")}</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-network-staking-user-guide"
					color="inherit"
					href="https://help.adex.network/hc/en-us/articles/9638410468508-How-to-stake-your-ADX-tokens-"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>{t("help.userGuide")}</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-network-staking-source-code"
					color="inherit"
					href="https://github.com/adexnetwork/adex-protocol-eth"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>{t("help.sourceCode")}</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-network-audits"
					color="inherit"
					href="https://github.com/adexnetwork/adex-protocol-eth#audits"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>{t("help.audits")}</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-wher-to-buy-markets"
					color="inherit"
					href="https://help.adex.network/hc/en-us/articles/9639404618268-How-can-I-get-ADX-tokens-List-of-exchanges-"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>{t("help.whereToBuy")}</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-contact-us"
					color="inherit"
					href="https://help.adex.network/hc/en-us/requests/new"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>{t("help.contactUs")}</MenuItem>
				</Link>
			</Menu>
		</>
	)
}
