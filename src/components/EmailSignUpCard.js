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
import { ExternalAnchor } from "./Anchor"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"
import { validateEmail } from "./../helpers/validation"
import {
	extractJSONResponseFromHTML,
	submitFormToMautic
} from "../mauticActions"
import { useTranslation, Trans } from "react-i18next"

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
		}),
		tosCheckbox: ({ errors }) => ({
			fontSize: 10,
			color: errors.tos ? theme.palette.error.main : theme.palette.text.main
		})
	}
})

export default function EmailSignUp(props) {
	const { t } = useTranslation()

	const [email, setEmail] = useState("")
	const [mauticState, setMauticState] = useState({})
	const [waiting, setWaiting] = useState(false)
	const [gdpr, setGDPR] = useState(false)
	const [tos, setTos] = useState(false)
	const [errors, setErrors] = useState({
		email: false,
		gdpr: false,
		tos: false
	})
	const classes = useStyles({ errors })

	useEffect(() => {
		// console.log(email, gdpr, errors)
	}, [email, gdpr, errors])

	const handleValidationErrors = () => {
		setErrors({
			email: !validateEmail(email),
			gdpr: !gdpr,
			tos: !tos
		})
	}

	const handleSubmit = async () => {
		handleValidationErrors()
		if (validateEmail(email) && gdpr && tos) {
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
						text={t("email.subscribe")}
						justify="center"
					/>
					<Box color="warning.main" fontWeight={"fontWeightBold"}>
						<Typography component="span" variant="h6">
							<Trans
								i18nKey="email.win"
								values={{
									rewards: "5x1,000"
								}}
								components={{
									strong: (
										<Typography
											className={classes.bold}
											component="span"
											variant="h5"
										></Typography>
									)
								}}
							/>
						</Typography>{" "}
					</Box>
					<Box width={1} mt={2}>
						<TextField
							id={"email-signup-email-input"}
							label={t("email.email")}
							variant="filled"
							color="secondary"
							onBlur={e =>
								setErrors({ ...errors, email: !validateEmail(e.target.value) })
							}
							onChange={e => setEmail(e.target.value)}
							helperText={
								errors.email ? t("email.validEmail") : t("email.bestEmail")
							}
							error={errors.email}
							fullWidth
						/>
					</Box>
					<Box mt={1} width={1}>
						<FormControl error={errors.gdpr}>
							<FormGroup>
								<FormControlLabel
									id={"email-signup-gdpr-checkbox"}
									onChange={e => setGDPR(e.target.checked)}
									name="gdpr"
									classes={{ label: classes.gdprCheckbox }}
									control={<Checkbox size="small" name="checkedA" />}
									label={t("email.gdprLabel")}
								/>
							</FormGroup>
						</FormControl>
					</Box>
					<Box mt={1} width={1}>
						<FormControl error={errors.tos}>
							<FormGroup>
								<FormControlLabel
									id={"email-signup-tos-checkbox"}
									onChange={e => setTos(e.target.checked)}
									name="tos"
									classes={{ label: classes.tosCheckbox }}
									control={<Checkbox size="small" name="checkedA" />}
									label={
										<Box>
											<Trans
												i18nKey="email.promotionTerms"
												components={{
													externalLink: (
														<ExternalAnchor
															color="secondary"
															id={"email-signup-tos-check"}
															target="_blank"
															href={`https://www.adex.network/blog/subscribe-and-win-5000-adx/`}
														/>
													)
												}}
											/>
										</Box>
									}
								/>
							</FormGroup>
						</FormControl>
					</Box>
					<Box width={1} mt={2} display="flex" justifyContent="center">
						<Button
							type="submit"
							id={`sign-up-email`}
							disabled={waiting}
							className={classes.singUp}
							onClick={() => handleSubmit()}
							variant="contained"
							color="secondary"
						>
							{waiting ? t("email.submitting") : t("email.submitBtnLabel")}
						</Button>
					</Box>
				</>
			)}
		</Box>
	)
}
