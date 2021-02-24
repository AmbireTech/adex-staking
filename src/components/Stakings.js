import React, { useContext } from "react"
import {
	Box,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from "@material-ui/core"
import { ExpandMore } from "@material-ui/icons"
import AppContext from "../AppContext"
import Bonds from "./Bonds"
import Deposits from "./Deposits"
import StakingPoolTxnsHistory from "./StakingPoolTxnsHistory"
import SectionHeader from "./SectionHeader"
import { useTranslation } from "react-i18next"

const Stakings = () => {
	const { t } = useTranslation()
	const {
		stats,
		setToUnbond,
		onUnbond,
		onMigrationRequest,
		onMigrationFinalize,
		setToRestake,
		onClaimRewards,
		onRebond
	} = useContext(AppContext)

	return (
		<Box>
			<SectionHeader title={t("common.staked")} />
			<Box mt={2}>
				<Box color="text.main">
					<Typography variant="h5" gutterBottom>
						{t("common.bonds")}
					</Typography>
				</Box>
				<Box mt={2} bgcolor="background.darkerPaper" boxShadow={25}>
					<Box p={3}>
						{Bonds({
							stats,
							onRequestUnbond: setToUnbond,
							onUnbond,
							onMigrationRequest,
							onMigrationFinalize,
							onClaimRewards,
							onRestake: setToRestake,
							onRebond
						})}
					</Box>
				</Box>
			</Box>
			<Box mt={2}>
				<Box color="text.main">
					<Typography variant="h5" gutterBottom>
						{t("common.deposits")}
					</Typography>
				</Box>

				<Box mt={3} bgcolor="background.darkerPaper" boxShadow={25}>
					<Box p={3}>
						<Deposits />
					</Box>
				</Box>
			</Box>
			<Box mt={2}>
				<Accordion square>
					<AccordionSummary
						expandIcon={<ExpandMore />}
						aria-controls="panel1a-content"
						id="panel1a-header"
					>
						<Typography>{t("deposits.txnsHistory")}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box mt={2} bgcolor="background.darkerPaper" width={1}>
							{StakingPoolTxnsHistory({
								stats
							})}
						</Box>
					</AccordionDetails>
				</Accordion>
			</Box>
		</Box>
	)
}

export default Stakings
