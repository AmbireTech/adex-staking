import React, { Fragment, useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Chip, Fab, Icon } from "@material-ui/core"
import { AccountBalanceWalletSharp as AccountBalanceWalletIcon } from "@material-ui/icons"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { formatAddress } from "../helpers/formatting"
import copy from "copy-to-clipboard"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	},
	chipRoot: {
		backgroundColor: theme.palette.background.darkerPaper,
		color: theme.palette.text.main,
		fontWeight: theme.typography.fontWeightBold,
		fontSize: theme.typography.pxToRem(15),
		// To match medium size fab
		height: 40,
		borderRadius: 40 / 2
	},
	chipIcon: {
		marginLeft: 9,
		marginRight: 0,
		width: 26,
		height: 26
	}
}))

export const Wallet = () => {
	const classes = useStyles()

	const { stats, setConnectWallet, chosenWalletType, addSnack } = useContext(
		AppContext
	)

	return (
		<Fragment>
			{!chosenWalletType.name || !stats.connectedWalletAddress ? (
				<Fab
					id="connect-wallet-btn-topbar"
					onClick={() => setConnectWallet(true)}
					variant="extended"
					color="secondary"
					size="medium"
					disabled={chosenWalletType.name && !stats.connectedWalletAddress}
				>
					<AccountBalanceWalletIcon className={classes.fabIcon} />
					{"Connect Wallet"}
				</Fab>
			) : (
				<Chip
					id="wallet-address-top-bar-copy"
					onClick={() => {
						copy(stats.connectedWalletAddress)
						addSnack(
							`Address ${stats.connectedWalletAddress} copied to clipboard`,
							"success"
						)
					}}
					clickable
					classes={{ root: classes.chipRoot, icon: classes.chipIcon }}
					icon={
						stats.connectedWalletAddress ? (
							<Icon>
								<Jazzicon
									diameter={26}
									seed={jsNumberForAddress(stats.connectedWalletAddress)}
								/>
							</Icon>
						) : null
					}
					label={formatAddress(stats.connectedWalletAddress)}
				/>
			)}
		</Fragment>
	)
}
