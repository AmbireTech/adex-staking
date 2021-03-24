import React from "react"
import StatsCard from "./StatsCard"
import { Button, Box } from "@material-ui/core"

import WithRouterLink from "./WithRouterLink"
import { useTranslation } from "react-i18next"

const RRButton = WithRouterLink(Button)

export default function RewardCard({ rewardChannels, userBonds }) {
	const { t } = useTranslation()

	const hasMigratableBonds = userBonds.find(
		x => x.status !== "Unbonded" && x.status !== "Migrated"
	)

	const rewardActions = (
		<Box display="flex" flexDirection="row" paddingTop={1} flex={1}>
			<Box width={1} pr={0.5}>
				{hasMigratableBonds && (
					<RRButton
						fullWidth
						to={{ pathname: "/stakings" }}
						color="primary"
						variant="contained"
					>
						{t("rewards.migrateYourBondsIfYouWandMigrate")}
					</RRButton>
				)}
			</Box>
		</Box>
	)
	return StatsCard({
		loaded: true,
		actions: rewardActions
	})
}
