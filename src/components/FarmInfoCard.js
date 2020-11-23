import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, Typography } from "@material-ui/core"
import { useTranslation, Trans } from "react-i18next"
import { ExternalAnchor } from "./Anchor"
import eddieTheFarmerInfo from "../resources/eddie-farmer-info-card.svg"

const useStyles = makeStyles(theme => {
	return {
		getLink: {
			marginLeft: theme.spacing(1)
		}
	}
})

export default function FarmCard() {
	const { t } = useTranslation()
	const classes = useStyles()

	return (
		<Box
			bgcolor={"background.card"}
			p={3}
			my={4}
			mx={2}
			width={320}
			maxWidth="100%"
			minHeight={420}
			display="flex"
			flexDirection="column"
			alignItems="center"
			boxShadow={25}
			position="relative"
		>
			<img
				src={eddieTheFarmerInfo}
				alt={t("farm.eddieFarmer")}
				style={{ maxWidth: 222 }}
			/>
			<Box my={3}>
				<Typography align="center" variant="h5" color="textPrimary">
					{t("farm.farmInfoCardText")}
				</Typography>
			</Box>

			<Typography align="center" variant="h6" color="textPrimary">
				<Trans
					i18nKey="farm.farmInfoCardTextLink"
					components={{
						externalLink: (
							<ExternalAnchor
								className={classes.getLink}
								color="secondary"
								id={`farm-info-card-blogpost-link`}
								target="_blank"
								href={`https://www.adex.network/blog/adex-farming/`}
							/>
						)
					}}
				/>
			</Typography>
		</Box>
	)
}
