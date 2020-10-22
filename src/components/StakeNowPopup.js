import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	SvgIcon,
	Box,
	Fab,
	Modal,
	Fade,
	Backdrop,
	Typography
} from "@material-ui/core"
import { ReactComponent as AdExIcon } from "./../resources/adex-logo-clean.svg"

import AppContext from "../AppContext"

import { useTranslation } from "react-i18next"

const useStyles = makeStyles(theme => {
	return {
		iconBoxBack: {
			borderRadius: "100%",
			position: "absolute",
			width: 92,
			height: 92,
			top: -46,
			left: "calc(50% - 46px)",
			background:
				"linear-gradient(142deg, rgba(222,222,222,1) 0%, rgba(255,255,255,0.53) 100%)",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center"
		},
		iconBox: {
			borderRadius: "100%",
			width: 82,
			height: 82,
			backgroundColor: theme.palette.common.white,
			color: theme.palette.background.default,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center"
		},
		top: {
			background: `radial-gradient(ellipse at bottom,  ${theme.palette.primary.main} 0%, ${theme.palette.background.darkerPaper} 100%)`
		},
		bottom: {
			position: "relative",
			background: theme.palette.common.white,
			borderTopLeftRadius: "100%",
			borderTopRightRadius: "100%",
			width: "130%",
			marginLeft: "-15%",
			marginTop: -69,
			padding: theme.spacing(3),
			paddingTop: 69 + theme.spacing(3),
			paddingInline: `calc(15% + ${theme.spacing(3)}px)`
		},
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
					<Box overflow="hidden">
						<Box height={169} classes={{ root: classes.top }}></Box>
						<Box height={350} classes={{ root: classes.bottom }}>
							<Box classes={{ root: classes.iconBoxBack }}>
								<Box classes={{ root: classes.iconBox }} fontSize={50}>
									<SvgIcon fontSize="inherit" color="inherit">
										<AdExIcon width="100%" height="100%" />
									</SvgIcon>
								</Box>
							</Box>
							<Box>
								<Typography variant="h4" color="primary">
									Stake NOW if you want stake
								</Typography>

								{
									<Fab
										id={`stake-popup-stake-btn`}
										// disabled={!stats.loaded || !canStake}
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
						</Box>
					</Box>
				</Fade>
			</Modal>
		</Box>
	)
}

export default StakeNowPopup
