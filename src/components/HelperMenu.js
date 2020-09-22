import React, { useState } from "react"
import { Button, Menu, Link, MenuItem } from "@material-ui/core"
import HelpIcon from "@material-ui/icons/HelpOutline"

export const Help = () => {
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
				startIcon={<HelpIcon size="large" />}
				onClick={openHelpMenu}
			>
				Help
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
					<MenuItem onClick={closeHelpMenu}>Terms of Service</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-network-staking-user-guide"
					color="inherit"
					href="https://help.adex.network/hc/en-us/categories/360002707720-Staking"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>User Guide</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-network-staking-source-code"
					color="inherit"
					href="https://github.com/adexnetwork/adex-protocol-eth"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>Source Code</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-network-audits"
					color="inherit"
					href="https://github.com/adexnetwork/adex-protocol-eth#audits"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>Audits</MenuItem>
				</Link>
				<Link
					id="help-menu-external-link-adex-wher-to-buy-markets"
					color="inherit"
					href="https://coinmarketcap.com/currencies/adx-net/markets/"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>Where to buy ADX</MenuItem>
				</Link>
			</Menu>
		</>
	)
}
