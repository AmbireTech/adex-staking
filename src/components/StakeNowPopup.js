import React, { useContext, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { fade } from "@material-ui/core/styles/colorManipulator"
import {
	SvgIcon,
	Box,
	Fab,
	Modal,
	Fade,
	Backdrop,
	Typography,
	Button
} from "@material-ui/core"
import { CardRow } from "./cardCommon"
import { ReactComponent as AdExIcon } from "./../resources/adex-logo-clean.svg"
import { formatADXPretty } from "../helpers/formatting"
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
			background: `linear-gradient(69deg, ${fade(
				theme.palette.lightGrey.main,
				0.69
			)} 0%, ${fade(theme.palette.common.white, 0.69)} 100%)`,
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
			background: `radial-gradient(
                ellipse at bottom,
                ${theme.palette.background.special} 0%,
                ${theme.palette.common.black} 110%
            )`

			// `radial-gradient(ellipse at bottom,  ${theme.palette.primary.main} 0%, ${theme.palette.background.darkerPaper} 100%)`
		},
		bottom: {
			position: "relative",
			background: theme.palette.common.white,
			borderTopLeftRadius: "100%",
			borderTopRightRadius: "100%",
			width: "142%",
			marginLeft: "-21%",
			marginTop: -90,
			padding: theme.spacing(3),
			paddingTop: 69 + theme.spacing(3),
			paddingInline: `calc(21% + ${theme.spacing(3)}px)`
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
		prices,
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
					<Box overflow="hidden" width={420} maxWidth={"100%"} m={1}>
						<Box height={200} classes={{ root: classes.top }}></Box>
						<Box classes={{ root: classes.bottom }}>
							<Box classes={{ root: classes.iconBoxBack }}>
								<Box classes={{ root: classes.iconBox }} fontSize={50}>
									<SvgIcon fontSize="inherit" color="inherit">
										<AdExIcon width="100%" height="100%" />
									</SvgIcon>
								</Box>
							</Box>
							<Box
								display="flex"
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
							>
								<Typography
									variant="h4"
									color="primary"
									gutterBottom
									align="center"
								>
									{t("popups.congratulations")}
								</Typography>
								<Typography
									variant="caption"
									color="primary"
									gutterBottom
									align="center"
								>
									{t("popups.proudOwnerOfADX")}
								</Typography>

								<Box my={3}>
									<CardRow
										color="text.main"
										fontWeight={"fontWeightBold"}
										fontSize={14}
										text={t("common.currencyBalance", { currency: "ADX" })}
										justify="center"
									/>

									<CardRow
										color="warning.main"
										fontWeight={"fontWeightBold"}
										fontSize={27}
										text={
											stats.userBalance
												? formatADXPretty(stats.userBalance) + " ADX"
												: ""
										}
										isAmountText
										justify="center"
									/>
								</Box>

								<Box my={1}>
									<Fab
										id={`stake-popup-stake-btn`}
										// disabled={!stats.loaded || !canStake}
										onClick={() => {
											setOpen(false)
											setNewBondPool("")
											setNewBondOpen(true)
										}}
										variant="extended"
										color="secondary"
										size="large"
									>
										{t("bonds.stakeADX")}
									</Fab>
								</Box>

								<Box my={1}>
									<Button
										id={`stake-popup-close-btn`}
										size="small"
										onClick={() => setOpen(false)}
										color="primary"
									>
										{t("common.goBack")}
									</Button>
								</Box>
							</Box>
						</Box>
					</Box>
				</Fade>
			</Modal>
		</Box>
	)
}

export default StakeNowPopup
