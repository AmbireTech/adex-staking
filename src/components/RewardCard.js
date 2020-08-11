import React from "react"
import StatsCard from "./StatsCard"
import { ZERO, ADDR_ADX } from "../helpers/constants"
import { Button, Tooltip } from "@material-ui/core"
import { formatDAI, formatADX } from "../helpers/utils"

export default function RewardCard({
	rewardChannels,
	earnedADX,
	onClaimRewards
}) {
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
	const sumRewards = all =>
		all.map(x => x.outstandingReward).reduce((a, b) => a.add(b), ZERO)
	const totalRewardADX = sumRewards(
		rewardChannels.filter(x => x.channelArgs.tokenAddr === ADDR_ADX)
	)
	const totalRewardDAI = sumRewards(
		rewardChannels.filter(x => x.channelArgs.tokenAddr !== ADDR_ADX)
	)
	const rewardActions = (
		<div>
			<Tooltip
				arrow={true}
				// @TODO use a grid instead of float
				style={{ float: "left", margin: 5 }}
				title={
					"Coming soon! Rewards withdraw will be available when the ADX token migration is completed."
				}
			>
				<div>
					<Button
						size="small"
						variant="contained"
						color="secondary"
						// disabled={totalRewardADX.add(totalRewardDAI).eq(ZERO)}
						disabled={true}
						// onClick={() => onClaimRewards(rewardChannels)}
					>
						claim
					</Button>
				</div>
			</Tooltip>
			<Button
				size="small"
				variant="contained"
				color="secondary"
				// @TODO use a grid instead of float
				style={{ float: "left", margin: 5 }}
				// disabled={totalRewardADX.add(totalRewardDAI).eq(ZERO)}
				// onClick={() => onClaimRewards(rewardChannels)}
			>
				re-stake
			</Button>
		</div>
	)
	return StatsCard({
		loaded: true,
		title,
		actions: rewardActions,
		subtitle: totalRewardDAI.gt(ZERO)
			? `${formatADX(totalRewardADX)} ADX, ${formatDAI(totalRewardDAI)} DAI`
			: `${formatADX(totalRewardADX)} ADX`
	})
}
