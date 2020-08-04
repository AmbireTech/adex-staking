import React from "react"
import StatsCard from "./StatsCard"
import { ZERO } from "../helpers/constants"
import { Button } from "@material-ui/core"
import { formatDAI, formatADX } from "../helpers/utils"
import { bigNumberify } from "ethers/utils"

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
		<Button
			size="small"
			variant="contained"
			color="secondary"
			disabled={totalReward.eq(ZERO)}
			onClick={() => onClaimRewards(rewardChannels)}
		>
			claim reward
		</Button>
	)
	return StatsCard({
		loaded: true,
		title,
		actions: rewardActions,
		subtitle: `${formatADX(bigNumberify(0))} ADX, ${formatDAI(totalReward)} DAI`
	})
}
