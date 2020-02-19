import React, { useState } from "react"
import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import HelpIcon from "@material-ui/icons/HelpOutline"
import Link from "@material-ui/core/Link"
import MenuItem from "@material-ui/core/MenuItem"
export default () => {
	const [menuEl, setMenuEl] = useState(null)
	const openHelpMenu = ev => {
		setMenuEl(ev.currentTarget)
	}
	const closeHelpMenu = () => {
		setMenuEl(null)
	}
	return (
		<>
			<IconButton
				style={{ position: "absolute", right: "1.25%", top: "10%" }}
				onClick={openHelpMenu}
			>
				<HelpIcon style={{ fontSize: "1.5em", color: "white" }} />
			</IconButton>
			<Menu
				id="simple-menu"
				anchorEl={menuEl}
				open={Boolean(menuEl)}
				keepMounted
				onClose={closeHelpMenu}
				getContentAnchorEl={null}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				transformOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Link href="https://www.adex.network/tos" target="_blank">
					<MenuItem onClick={closeHelpMenu}>Terms of Service</MenuItem>
				</Link>
				<Link
					href="https://www.adex.network/blog/adx-staking-is-here/"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>User Guide</MenuItem>
				</Link>
				<Link
					href="https://github.com/adexnetwork/adex-protocol-eth"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>Source Code</MenuItem>
				</Link>
				<Link
					href="https://coinmarketcap.com/currencies/adx-net/markets/"
					target="_blank"
				>
					<MenuItem onClick={closeHelpMenu}>Where to buy ADX</MenuItem>
				</Link>
			</Menu>
		</>
	)
}
