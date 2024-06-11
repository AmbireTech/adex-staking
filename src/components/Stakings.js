import React, { useContext } from "react"
import {
	Box,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	styled
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
		onMigrationFinalize,
		onClaimRewards,
		onRebond
	} = useContext(AppContext)

	const StyledAccordion = styled(Accordion)(({ theme }) => ({
		backgroundColor: "transparent",
		border: `1px solid ${theme.palette.text.secondaryLight}`,
		borderRadius: "10px",
		boxShadow: "none"
	}))

	return (
		<Box>
			<Box mt={2} mb={10}>
				<Box color="text.main">
					<Typography variant="h5" gutterBottom>
						{t("common.staked")}
					</Typography>
				</Box>
				<Box mt={5}>
					{Bonds({
						stats,
						onRequestUnbond: setToUnbond,
						onUnbond,
						onMigrationFinalize,
						onClaimRewards,
						onRebond
					})}
				</Box>
			</Box>
			<Box mt={2} mb={10}>
				<Box color="text.main">
					<Typography variant="h5" gutterBottom>
						{t("common.deposits")}
					</Typography>
				</Box>
				<Box mt={5}>
					<Deposits />
				</Box>
			</Box>
			<Box mt={2}>
				<StyledAccordion square>
					<AccordionSummary
						expandIcon={<ExpandMore />}
						aria-controls="panel1a-content"
						id="panel1a-header"
					>
						<Typography>{t("deposits.txnsHistory")}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box mt={0} width={1}>
							{StakingPoolTxnsHistory({
								stats
							})}
						</Box>
					</AccordionDetails>
				</StyledAccordion>
			</Box>
		</Box>
	)
}

export default Stakings
