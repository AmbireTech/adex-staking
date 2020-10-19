import React, { useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Fab, Box, Typography } from "@material-ui/core"
import { AddSharp as AddIcon } from "@material-ui/icons"
import { toIdAttributeString } from "../helpers/formatting"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	}
}))

const SectionHeader = ({ title, actions }) => {
	const { t } = useTranslation()
	const classes = useStyles()

	const {
		stats,
		setNewBondOpen,
		chosenWalletType,
		setNewBondPool
	} = useContext(AppContext)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

	return (
		<Box
			display="flex"
			flexDirection="row"
			justifyContent="space-between"
			alignItems="center"
			flexWrap="wrap"
		>
			<Box color="text.main" mb={1}>
				<Typography variant="h3">{title}</Typography>
			</Box>
			<Box mb={1}>
				{!!actions
					? actions
					: chosenWalletType.name && (
							<Fab
								id={`section-header-fab-stake-adx-${toIdAttributeString(
									title
								)}`}
								disabled={!stats.loaded || !canStake}
								onClick={() => {
									setNewBondPool("")
									setNewBondOpen(true)
								}}
								variant="extended"
								color="secondary"
								size="medium"
							>
								<AddIcon className={classes.fabIcon} />

								{t("bonds.stakeADX")}
							</Fab>
					  )}
			</Box>
		</Box>
	)
}

export default SectionHeader
