import React from "react"
import StatsCard from "./StatsCard"
import { ZERO } from "../helpers/constants"
import { Button, Tooltip, Link } from "@material-ui/core"
import { formatDAI } from "../helpers/utils"

export default function RewardCard({ rewardChannels, onClaimRewards }) {
	const title = "Your total unclaimed reward"
	const loaded = rewardChannels != null
	if (!loaded) {
		return StatsCard({
			loaded,
			title,
			extra: "0.00 USD",
			subtitle: "0.00 DAI"
		})
	}
	const totalReward = rewardChannels
		.map(x => x.outstandingReward)
		.reduce((a, b) => a.add(b), ZERO)
	const rewardActions = (
		<Tooltip
			interactive
			placement="bottom"
			open={true}
			arrow={true}
			title={
				"Coming soon! Rewards withdraw will be available when the ADX token migration is completed."
			}
		>
			<Button
				size="small"
				variant="contained"
				color="secondary"
				// disabled={totalReward.eq(ZERO)}
				disabled={true}
				onClick={() => onClaimRewards(rewardChannels)}
			>
				claim reward
			</Button>
		</Tooltip>
	)
	return StatsCard({
		loaded: true,
		title,
		actions: rewardActions,
		subtitle: formatDAI(totalReward) + " DAI"
	})
}
