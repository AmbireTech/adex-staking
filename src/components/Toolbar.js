import React from "react"
import PropTypes from "prop-types"
import {
	AppBar,
	Toolbar,
	Fab,
	IconButton,
	Box,
	Hidden
} from "@material-ui/core"
import { AddSharp as AddIcon, MenuSharp as MenuIcon } from "@material-ui/icons"
import { Help } from "./HelperMenu"
import { Wallet } from "./WalletMenu"
import { themeMUI } from "./../themeMUi"
import { styles } from "./rootStyles"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(styles)

export const AppToolbar = ({
	chosenWalletType,
	setConnectWallet,
	setNewBondOpen,
	stats,
	handleDrawerToggle
}) => {
	const classes = useStyles()

	return (
		<AppBar className={classes.appBar} color="transparent" position="static">
			<Toolbar className={classes.toolbar}>
				<Hidden mdUp>
					<Box pl={1}>
						<IconButton
							color="secondary"
							aria-label="open drawer"
							onClick={handleDrawerToggle}
						>
							<MenuIcon />
						</IconButton>
					</Box>
				</Hidden>
				{chosenWalletType.name && (
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

				<Help />
				<Wallet />
			</Toolbar>
		</AppBar>
	)
}

AppToolbar.propTypes = {
	chosenWalletType: PropTypes.string,
	setConnectWallet: PropTypes.func.isRequired,
	setNewBondOpen: PropTypes.func.isRequired,
	stats: PropTypes.object.isRequired
}
