import React, { Fragment, useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Chip, Fab } from "@material-ui/core"
import { AccountBalanceWalletSharp as AccountBalanceWalletIcon } from "@material-ui/icons"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { formatAddress } from "../helpers/formatting"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	}
}))

export const Wallet = () => {
	const classes = useStyles()

	const { stats, setConnectWallet, chosenWalletType } = useContext(AppContext)

	return (
		<Fragment>
			{!chosenWalletType.name && (
				<Fab
					onClick={() => setConnectWallet(true)}
					variant="extended"
					color="secondary"
				>
					<AccountBalanceWalletIcon className={classes.fabIcon} />
					{"Connect Wallet"}
				</Fab>
			)}

			<Chip
				avatar={
					<Jazzicon
						diameter={26}
						seed={jsNumberForAddress(stats.connectedWalletAddress || "")}
					/>
				}
				label={formatAddress(stats.connectedWalletAddress)}
			/>
		</Fragment>
	)
}
