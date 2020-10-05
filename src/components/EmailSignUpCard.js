import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	Typography,
	Checkbox,
	FormGroup,
	FormControl,
	FormHelperText,
	FormControlLabel,
	TextField,
} from "@material-ui/core"
import { CardRow } from "./cardCommon"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"
import { validateEmail } from "./../helpers/validation"

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
			fontSize: 10,
		},
	}
})

export default function EmailSignUp() {
	const classes = useStyles()
	const [email, setEmail] = useState("")
	const [gdpr, setGDPR] = useState(false)
	const [errors, setErrors] = useState({
		email: false,
		gdpr: false,
		initialTouch: true,
	})

	useEffect(() => {
		console.log(email, gdpr)
	}, [email, gdpr])

	const handleSubmit = () => {
		setErrors({
			email: !validateEmail(email),
			gdpr: !gdpr,
			initialTouch: false,
		})
		const hasErrors = Object.values(errors).filter((i) => i).length > 0
		console.log(hasErrors, errors)
		if (!hasErrors) {
			console.log("success")
		} else {
			console.log(errors)
		}
	}

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
					onChange={(e) => setEmail(e.target.value)}
					helperText={errors.email ? "Please provide a valid email!" : ""}
					error={errors.email}
					fullWidth
				/>
			</Box>
			<Box mt={1} width={1}>
				<FormControl error={errors.gdpr}>
					<FormGroup>
						<FormControlLabel
							onChange={(e) => setGDPR(e.target.checked)}
							name="gdpr"
							classes={{ label: classes.gdprCheckbox }}
							control={<Checkbox size="small" name="checkedA" />}
							label={`Yes, I want AdEx Network to send me news and other related content`}
						/>
					</FormGroup>
					{errors.gdpr && (
						<Box>
							<FormHelperText classes={{ root: classes.gdprCheckbox }}>
								This checkbox is required!
							</FormHelperText>
						</Box>
					)}
				</FormControl>
			</Box>
			<Box width={1} mt={3} display="flex" justifyContent="center">
				<Button
					type="submit"
					id={`sign-up`}
					className={classes.singUp}
					onClick={() => handleSubmit()}
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
