import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	Typography,
	Checkbox,
	FormGroup,
	FormControl,
	FormControlLabel,
	TextField
} from "@material-ui/core"
import { CardRow } from "./cardCommon"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"
import { validateEmail } from "./../helpers/validation"
import {
	extractJSONResponseFromHTML,
	submitFormToMautic
} from "../mauticActions"

const useStyles = makeStyles(theme => {
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
			justifyContent: "center"
		},
		bold: {
			fontWeight: 800
		},
		singUp: {
			backgroundColor: theme.palette.text.main,
			borderRadius: 20
		},
		gdprCheckbox: ({ errors }) => ({
			fontSize: 10,
			color: errors.gdpr ? theme.palette.error.main : theme.palette.text.main
		})
	}
})

export default function EmailSignUp(props) {
	const [email, setEmail] = useState("")
	const [mauticState, setMauticState] = useState({})
	const [waiting, setWaiting] = useState(false)
	const [gdpr, setGDPR] = useState(false)
	const [errors, setErrors] = useState({
		email: false,
		gdpr: false
	})
	const classes = useStyles({ errors })

	useEffect(() => {
		// console.log(email, gdpr, errors)
	}, [email, gdpr, errors])

	const handleValidationErrors = () => {
		setErrors({
			email: !validateEmail(email),
			gdpr: !gdpr
		})
	}

	const handleSubmit = async () => {
		handleValidationErrors()
		if (validateEmail(email) && gdpr) {
			console.log("success")
			setWaiting(true)
			try {
				const HTMLResponse = await submitFormToMautic({ ...props, email })
				const jsonResponse = await extractJSONResponseFromHTML(HTMLResponse)
				setMauticState({
					...jsonResponse
				})
			} catch (error) {
				// If cors is not enabled for address
				console.error(error)
			}
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
			{/* Used for debugging mautic responses */}
			{/* <Box>{JSON.stringify(mauticState)}</Box> */}
			<Box classes={{ root: classes.iconBox }}>
				<EmailAwardsIcon />
			</Box>
			{mauticState.success ? (
				<CardRow
					mt={3}
					color="white"
					fontWeight={"fontWeightBold"}
					fontSize={16}
					text={mauticState.successMessage}
					justify="center"
					height={1}
					display="flex"
				/>
			) : (
				<>
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
							<Typography
								className={classes.bold}
								component="span"
								variant="h5"
							>
								{` 5x1000 `}
							</Typography>
							ADX!
						</Typography>{" "}
					</Box>
					<Box width={1} mt={2}>
						<TextField
							id="standard-helperText"
							label="Email"
							variant="filled"
							color="secondary"
							onBlur={e =>
								setErrors({ ...errors, email: !validateEmail(e.target.value) })
							}
							onChange={e => setEmail(e.target.value)}
							helperText={
								errors.email
									? "Please provide a valid email!"
									: "Please provide your best email"
							}
							error={errors.email}
							fullWidth
						/>
					</Box>
					<Box mt={1} width={1}>
						<FormControl error={errors.gdpr}>
							<FormGroup>
								<FormControlLabel
									onChange={e => setGDPR(e.target.checked)}
									name="gdpr"
									classes={{ label: classes.gdprCheckbox }}
									control={<Checkbox size="small" name="checkedA" />}
									label={`Yes, I want AdEx Network to send me news and other related content`}
								/>
							</FormGroup>
						</FormControl>
					</Box>
					<Box width={1} mt={2} display="flex" justifyContent="center">
						<Button
							type="submit"
							id={`sign-up`}
							disabled={waiting}
							className={classes.singUp}
							onClick={() => handleSubmit()}
							variant="contained"
							color="secondary"
						>
							{waiting ? "Submitting..." : "Sure, I'm in"}
						</Button>
					</Box>
				</>
			)}
		</Box>
	)
}
