import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, Fab, Modal, Fade, Backdrop } from "@material-ui/core"

import AppContext from "../AppContext"

import { useTranslation } from "react-i18next"

const useStyles = makeStyles(theme => {
	return {
		modal: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}
	}
})

const StakeNowPopup = () => {
	const { t } = useTranslation()
	const classes = useStyles()
	const [open, setOpen] = useState(true)

	const {
		stats,
		setNewBondOpen,
		chosenWalletType,
		setNewBondPool
	} = useContext(AppContext)

	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

	return (
		<Box>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				className={classes.modal}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 300
				}}
			>
				<Fade in={open}>
					<Box>
						Stake NOW if you want stake
						{
							<Fab
								id={`stake-popup-stake-btn`}
								disabled={!stats.loaded || !canStake}
								onClick={() => {
									setNewBondPool("")
									setNewBondOpen(true)
								}}
								variant="extended"
								color="secondary"
								size="medium"
							>
								{t("bonds.stakeADX")}
							</Fab>
						}
					</Box>
				</Fade>
			</Modal>
		</Box>
	)
}

export default StakeNowPopup
