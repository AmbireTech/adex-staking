import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	Typography,
	Checkbox,
	FormControlLabel,
	TextField,
} from "@material-ui/core"
import { CardRow } from "./cardCommon"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"

const useStyles = makeStyles((theme) => {
	return {
		iconBox: {
			borderRadius: "100%",
			position: "absolute",
			width: 160,
			height: 160,
			top: -theme.spacing(4),
			backgroundColor: "transparent",
			color: theme.palette.background.default,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
		},
		bold: {
			fontWeight: 800,
		},
		singUp: {
			backgroundColor: theme.palette.text.main,
			borderRadius: 20,
		},
		gdprCheckbox: {
			fontSize: 11,
		},
	}
})

export default function EmailSignUp({}) {
	const classes = useStyles()

	return (
		<Box
			bgcolor={"background.paper"}
			p={3}
			my={3}
			mx={1.5}
			pt={15}
			width={270}
			maxWidth="100%"
			minHeight={420}
			display="flex"
			flexDirection="column"
			alignItems="center"
			boxShadow={25}
			position="relative"
		>
			<CardRow
				mt={3}
				color="white"
				fontWeight={"fontWeightBold"}
				fontSize={16}
				text={"Subscribe for AdEx News &"}
				justify="center"
			/>
			<Box color="warning.main" fontWeight={"fontWeightBold"}>
				<Typography component="span" variant="h6">
					win
					<Typography className={classes.bold} component="span" variant="h5">
						{` 5x1000 `}
					</Typography>
					ADX!
				</Typography>{" "}
			</Box>
			<Box width={1} mt={3}>
				<TextField
					id="standard-helperText"
					label="Email"
					variant="filled"
					color="secondary"
					fullWidth
				/>
			</Box>
			<Box mt={1}>
				<FormControlLabel
					classes={{ label: classes.gdprCheckbox }}
					control={<Checkbox size="small" name="checkedA" />}
					label={`Yes, I want AdEx Network to send me news and other related content`}
				/>
			</Box>
			<Box width={1} mt={3} display="flex" justifyContent="center">
				<Button
					id={`sign-up`}
					className={classes.singUp}
					variant="contained"
					color="secondary"
				>
					{"Sure, I'm in"}
				</Button>
			</Box>
			<Box classes={{ root: classes.iconBox }}>
				<EmailAwardsIcon />
			</Box>
		</Box>
	)
}
