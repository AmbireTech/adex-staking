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
	TextField,
} from "@material-ui/core"
import { CardRow } from "./cardCommon"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"
import { validateEmail } from "./../helpers/validation"
import { stringify } from "query-string"

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
		gdprCheckbox: ({ errors }) => ({
			fontSize: 10,
			color: errors.gdpr ? theme.palette.error.main : theme.palette.text.main,
		}),
	}
})

export default function EmailSignUp(props) {
	const [email, setEmail] = useState("")
	const [mauticState, setMauticState] = useState({})
	const [waiting, setWaiting] = useState(false)
	const [gdpr, setGDPR] = useState(false)
	const [errors, setErrors] = useState({
		email: false,
		gdpr: false,
	})
	const classes = useStyles({ errors })

	useEffect(() => {
		console.log(email, gdpr, errors)
	}, [email, gdpr, errors])

	const handleValidationErrors = () => {
		setErrors({
			email: !validateEmail(email),
			gdpr: !gdpr,
		})
	}

	const handleSubmit = async () => {
		handleValidationErrors()
		if (validateEmail(email) && gdpr) {
			console.log("success")
			const { formId, returnValue, formName, messenger } = props
			const data = stringify({
				"mauticform[email]": email,
				"mauticform[formId]": formId || "",
				"mauticform[return]": returnValue || "",
				"mauticform[formName]": formName || "",
				"mauticform[messenger]": messenger || true,
			})
			setWaiting(true)
			try {
				const response = await fetch(
					`https://mautic.adex.net/form/submit?formId=${formId}`,
					{
						method: "POST",
						body: data,
						headers: {
							"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
							"X-Requested-With": "XMLHttpRequest",
						},
					}
				)
				const utf8Decoder = new TextDecoder("utf-8")
				const reader = response.body.getReader()
				let { value: mauticDataResponse } = await reader.read()
				mauticDataResponse = mauticDataResponse
					? utf8Decoder.decode(mauticDataResponse)
					: ""
				console.log(mauticDataResponse)
				//TODO: when we have more email forms this should be extracted in helper
				const regex = /parent.postMessage\("(.+)".+\)/gm
				const matches = regex.exec(mauticDataResponse)
				if (matches && matches.length >= 1) {
					const message = matches[1]
					let messageCopy = message
					const asciiRegex = /\\.../gm
					let m
					while ((m = asciiRegex.exec(message)) !== null) {
						// This is necessary to avoid infinite loops with zero-width matches
						if (m.index === asciiRegex.lastIndex) {
							asciiRegex.lastIndex++
						}

						// The result can be accessed through the `m`-variable.
						/*eslint no-loop-func: "off"*/
						m.forEach((match, groupIndex) => {
							const decoded = String.fromCharCode(match.replace("\\", 0))
							messageCopy = messageCopy.split(match).join(decoded)
						})
					}
					// not able to JSON parse directly so I had to do this above
					const messageParsed = JSON.parse(messageCopy)
					console.log(JSON.parse(messageCopy))
					setMauticState({
						successSignUp: !!messageParsed.success,
						...messageParsed,
					})
				} else {
					console.log(`No matches found:`, mauticDataResponse)
				}
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
					onBlur={(e) =>
						setErrors({ ...errors, email: !validateEmail(e.target.value) })
					}
					onChange={(e) => setEmail(e.target.value)}
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
							onChange={(e) => setGDPR(e.target.checked)}
							error={errors.gdpr}
							name="gdpr"
							classes={{ label: classes.gdprCheckbox }}
							control={<Checkbox size="small" name="checkedA" />}
							label={`Yes, I want AdEx Network to send me news and other related content`}
						/>
					</FormGroup>
				</FormControl>
			</Box>
			<Box>{JSON.stringify(mauticState)}</Box>
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
