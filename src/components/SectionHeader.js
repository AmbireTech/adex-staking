import React, { useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Fab, Box, Typography } from "@material-ui/core"
import { AddSharp as AddIcon } from "@material-ui/icons"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	}
}))

const SectionHeader = ({ title, actions }) => {
	const classes = useStyles()

	const { stats, setNewBondOpen, chosenWalletType } = useContext(AppContext)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

	return (
		<Box display="flex" flexDirection="row" justifyContent="space-between">
			<Box>
				<Typography variant="h3">{title}</Typography>
			</Box>
			<Box>
				{!!actions
					? actions
					: chosenWalletType.name && (
							<Fab
								disabled={!stats.loaded || !canStake}
								onClick={() => setNewBondOpen(true)}
								variant="extended"
								color="secondary"
								size="medium"
							>
								<AddIcon className={classes.fabIcon} />
								{"Stake your ADX"}
							</Fab>
					  )}
			</Box>
		</Box>
	)
}

export default SectionHeader
