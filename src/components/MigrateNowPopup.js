import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Modal,
	Fade,
	Backdrop,
	Typography,
	Button
} from "@material-ui/core"
import { Alert, AlertTitle } from "@material-ui/lab"
import { ReactComponent as MigrationIcon } from "./../resources/migration-ic.svg"
import AppContext from "../AppContext"
import MigrationBtn from "./MigrationBtn"

import { useTranslation } from "react-i18next"

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "100%",
			position: "absolute",
			width: 92,
			height: 92,
			top: -56,
			left: "calc(50% - 46px)",
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
			paddingLeft: `calc(21% + ${theme.spacing(3)}px)`,
			paddingRight: `calc(21% + ${theme.spacing(3)}px)`
		},
		modal: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}
	}
})

export const MigrateNowAlert = () => {
	const { t } = useTranslation()

	const { stats } = useContext(AppContext)

	const { hasToMigrate, bondToMigrate } = stats.tomBondsMigrationData

	return (
		// hasToMigrate &&
		<Box>
			<Alert severity="info" variant="filled">
				<AlertTitle id="alert-chain-warning-title">
					{/* <Typography
						variant="caption"
						gutterBottom
						align="center"
					> */}
					{t("popups.migrationAlert")}
					{/* </Typography> */}
				</AlertTitle>
				<Box id="alert-chain-description" display="flex" flexDirection="column">
					{/* <Typography
						variant="caption"
						gutterBottom
						align="center"
					> */}
					{t("popups.migrationAlertInfoMigrate", {
						count: hasToMigrate && !bondToMigrate ? 2 : 1
					})}
					{/* </Typography> */}
					<Box mt={1}>
						<MigrationBtn variant="contained" color="secondary" size="small" />
					</Box>
				</Box>
			</Alert>
		</Box>
	)
}

export const MigrateNowPopup = () => {
	const { t } = useTranslation()
	const classes = useStyles()
	const [open, setOpen] = useState(true)

	const { stats } = useContext(AppContext)

	const { hasToMigrate, bondToMigrate } = stats.tomBondsMigrationData

	useEffect(() => {
		setOpen(hasToMigrate)
	}, [hasToMigrate])

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
							<Box classes={{ root: classes.iconBox }}>
								<MigrationIcon width="100%" height="100%" />
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
									{t("popups.migrationAlert")}
								</Typography>
								<Typography
									variant="caption"
									color="primary"
									gutterBottom
									align="center"
								>
									{t("popups.migrationAlertInfoMigrate", {
										count: hasToMigrate && !bondToMigrate ? 2 : 1
									})}
								</Typography>

								<Box my={2}>
									<MigrationBtn
										onBeforeOpen={() => setOpen(false)}
										fabButton
										color="secondary"
										size="medium"
									/>
								</Box>

								<Box my={2}>
									<Button
										id={`stake-popup-close-btn`}
										size="small"
										onClick={() => setOpen(false)}
										color="primary"
									>
										{t("popups.notNow")}
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
