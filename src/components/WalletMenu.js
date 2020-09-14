import React, { Fragment, useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Chip, Fab, Avatar } from "@material-ui/core"
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
			{!chosenWalletType.name || !stats.connectedWalletAddress ? (
				<Fab
					onClick={() => setConnectWallet(true)}
					variant="extended"
					color="secondary"
					size="small"
					disabled={chosenWalletType.name && !stats.connectedWalletAddress}
				>
					<AccountBalanceWalletIcon className={classes.fabIcon} />
					{"Connect Wallet"}
				</Fab>
			) : (
				<Chip
					avatar={
						stats.connectedWalletAddress ? (
							<Avatar>
								<Jazzicon
									diameter={26}
									seed={jsNumberForAddress(stats.connectedWalletAddress)}
								/>
							</Avatar>
						) : null
					}
					label={formatAddress(stats.connectedWalletAddress)}
				/>
			)}
		</Fragment>
	)
}
