import React from "react"
import PropTypes from "prop-types"
import { AppBar, Toolbar, Fab } from "@material-ui/core"
import {
	AccountBalanceWalletSharp as AccountBalanceWalletIcon,
	AddSharp as AddIcon
} from "@material-ui/icons"
import HelperMenu from "./HelperMenu"
import logo from "./../adex-staking.svg"
import { themeMUI } from "./../themeMUi"

export const AppToolbar = ({
	chosenWalletType,
	setConnectWallet,
	setNewBondOpen,
	stats
}) => (
	<AppBar position="static">
		<Toolbar>
			<img height="40vh" src={logo} alt="logo"></img>
			{chosenWalletType && (
				<Fab
					disabled={!stats.loaded}
					onClick={() => setNewBondOpen(true)}
					variant="extended"
					color="secondary"
					style={{ position: "absolute", right: "5%", top: "50%" }}
				>
					<AddIcon style={{ margin: themeMUI.spacing(1) }} />
					{"Stake your ADX"}
				</Fab>
			)}
			{!chosenWalletType && (
				<Fab
					onClick={() => setConnectWallet(true)}
					variant="extended"
					color="secondary"
					style={{ position: "absolute", right: "5%", top: "50%" }}
				>
					<AccountBalanceWalletIcon style={{ margin: themeMUI.spacing(1) }} />
					{"Connect Wallet"}
				</Fab>
			)}
			{HelperMenu()}
		</Toolbar>
	</AppBar>
)

AppToolbar.propTypes = {
	chosenWalletType: PropTypes.string,
	setConnectWallet: PropTypes.func.isRequired,
	setNewBondOpen: PropTypes.func.isRequired,
	stats: PropTypes.object.isRequired
}
