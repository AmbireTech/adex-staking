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
import { useTranslation } from "react-i18next"
import { BigNumber } from "ethers"

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
		boxShadow: "none",
		"& .MuiAccordionDetails-root": {
			paddingTop: 0
		},
		"& .MuiAccordionSummary-content": {
			margin: 0
		}
	}))

	return (
		<Box>
			<Box mt={2} mb={10}>
				<Box color="text.secondaryLight">
					<Typography variant="h5" gutterBottom>
						{t("common.staked")}
					</Typography>
				</Box>
				<Box mt={5}>
					{Bonds({
						stats: {
							loaded: true,
							tomPoolStats: {
								totalAPY: 0.1234 // Example APY value
							},
							userBonds: [
								{
									status: "Active",
									currentAmount: BigNumber.from("1000000000000000000000"), // 1000 ADX
									poolId: "pool1",
									nonce: { gt: () => false, toNumber: () => 0 },
									time: {
										toNumber: () => Math.floor(Date.now() / 1000) - 86400
									}, // 1 day ago
									willUnlock: null
								},
								{
									status: "UnbondRequested",
									currentAmount: BigNumber.from("500000000000000000000"), // 500 ADX
									poolId: "pool2",
									nonce: {
										gt: () => true,
										toNumber: () => Math.floor(Date.now() / 1000) - 172800
									}, // 2 days ago
									time: {
										toNumber: () => Math.floor(Date.now() / 1000) - 172800
									}, // 2 days ago
									willUnlock: new Date(Date.now() + 2 * 86400000) // 2 days in the future
								},
								{
									status: "UnbondRequested",
									currentAmount: BigNumber.from("300000000000000000000"), // 300 ADX
									poolId: "pool3",
									nonce: {
										gt: () => true,
										toNumber: () => Math.floor(Date.now() / 1000) - 259200
									}, // 3 days ago
									time: {
										toNumber: () => Math.floor(Date.now() / 1000) - 259200
									}, // 3 days ago
									willUnlock: new Date(Date.now() - 86400000) // 1 day in the past
								},
								{
									status: "Active",
									currentAmount: BigNumber.from("2000000000000000000000"), // 2000 ADX
									poolId: "pool4",
									nonce: {
										gt: () => true,
										toNumber: () => Math.floor(Date.now() / 1000) - 604800
									}, // 7 days ago
									time: {
										toNumber: () => Math.floor(Date.now() / 1000) - 604800
									}, // 7 days ago
									willUnlock: null
								},
								{
									status: "Active",
									currentAmount: BigNumber.from("1500000000000000000000"), // 1500 ADX
									poolId: "pool5",
									nonce: { gt: () => false, toNumber: () => 0 },
									time: {
										toNumber: () => Math.floor(Date.now() / 1000) - 864000
									}, // 10 days ago
									willUnlock: null
								},
								{
									status: "UnbondRequested",
									currentAmount: BigNumber.from("1200000000000000000000"), // 1200 ADX
									poolId: "pool6",
									nonce: {
										gt: () => true,
										toNumber: () => Math.floor(Date.now() / 1000) - 432000
									}, // 5 days ago
									time: {
										toNumber: () => Math.floor(Date.now() / 1000) - 432000
									}, // 5 days ago
									willUnlock: new Date(Date.now() + 86400000) // 1 day in the future
								}
							]
						},
						onRequestUnbond: setToUnbond,
						onUnbond,
						onMigrationFinalize,
						onClaimRewards,
						onRebond
					})}
				</Box>
			</Box>
			<Box mt={2} mb={10}>
				<Box color="text.secondaryLight">
					<Typography variant="h5" gutterBottom>
						{t("common.deposits")}
					</Typography>
				</Box>
				<Box mt={5}>
					<Deposits />
				</Box>
			</Box>
			<Box mt={0}>
				<StyledAccordion square>
					<AccordionSummary
						expandIcon={<ExpandMore />}
						aria-controls="panel1a-content"
						id="panel1a-header"
					>
						<Typography m={0}>{t("deposits.txnsHistory")}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box width={1}>
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
