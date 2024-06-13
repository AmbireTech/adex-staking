import React from "react" // , { useState, useEffect }
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	ButtonBase,
	// Checkbox,
	// FormGroup,
	// FormControl,
	// FormControlLabel,
	TextField
} from "@material-ui/core"
import { CardRow } from "./cardCommon"
// import { ExternalAnchor } from "./Anchor"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"
import useEmailSubscription from "../hooks/useEmailSubscription"
import { useTranslation, Trans } from "react-i18next"
import CustomButton from "./CustomButton"
import CustomTextField from "./CustomTextField"

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "100%",
			width: 160,
			height: 160,
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
	const {
		email,
		setEmail,
		errorMessage,
		successMessage,
		submitForm,
		waiting
	} = useEmailSubscription()

	const classes = useStyles({ errors: successMessage })

	return (
		<Box
			bgcolor={"background.card"}
			p={3}
			my={3}
			mx={1.5}
			width={270}
			maxWidth="100%"
			minHeight={400}
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
			{successMessage ? (
				<CardRow
					mt={3}
					color="text.primary"
					fontWeight={"fontWeightBold"}
					fontSize={16}
					text={successMessage}
					justify="center"
					height={1}
					display="flex"
				/>
			) : (
				<>
					<CardRow
						mt={0}
						color="text.primary"
						fontSize={16}
						textAlign="center"
						text={<Trans i18nKey="email.subscribe" />}
						justify="center"
					/>
					<Box width={1} mt={2}>
						<CustomTextField
							label={t("email.enterYourEmail")}
							value={email}
							// onBlur={e =>
							// 	setErrors({ ...errors, email: !validateEmail(e.target.value) })
							// }
							onChange={e => setEmail(e.target.value)}
							helperText={errorMessage}
							error={errorMessage}
						/>
					</Box>
					{/* <Box mt={1} width={1}>
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
					</Box> */}
					{/* <Box mt={1} width={1}>
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
						</Box> */}
					<Box width={1} mt={3} display="flex" justifyContent="center">
						<CustomButton
							btnType="outline"
							type="submit"
							onClick={submitForm}
							id={`sign-up-email`}
						>
							{waiting ? t("email.submitting") : t("email.submitBtnLabel")}
						</CustomButton>
					</Box>
				</>
			)}
		</Box>
	)
}
