import React, { useContext } from "react"
import { Box, Typography } from "@material-ui/core"
import AppContext from "../AppContext"
import Bonds from "./Bonds"
import Deposits from "./Deposits"
import SectionHeader from "./SectionHeader"
import { useTranslation } from "react-i18next"

const Stakings = () => {
	const { t } = useTranslation()
	const {
		stats,
		setToUnbond,
		onUnbond,
		onMigration,
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
							onMigration,
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
		</Box>
	)
}

export default Stakings
