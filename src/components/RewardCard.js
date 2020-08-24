import React from "react"
import StatsCard from "./StatsCard"
import { ZERO, ADDR_ADX } from "../helpers/constants"
import { Button, Box } from "@material-ui/core"
import { formatDAIPretty, formatADXPretty } from "../helpers/formatting"

export default function RewardCard({
	rewardChannels,
	userBonds,
	onClaimRewards,
	onRestake
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
	const restakeEnabled =
		totalRewardADX.gt(ZERO) && userBonds.find(x => x.status !== "Unbonded")
	const rewardActions = (
		<Box display="flex" flexDirection="row" paddingTop={1}>
			<Button
				size="small"
				variant="contained"
				color="secondary"
				disabled={totalRewardADX.add(totalRewardDAI).eq(ZERO)}
				onClick={() => onClaimRewards(rewardChannels)}
			>
				claim
			</Button>
			<Box ml={1}>
				<Button
					size="small"
					variant="contained"
					color="secondary"
					disabled={!restakeEnabled}
					onClick={() => onRestake(totalRewardADX)}
				>
					re-stake
				</Button>
			</Box>
		</Box>
	)
	return StatsCard({
		loaded: true,
		title,
		actions: rewardActions,
		subtitle: totalRewardDAI.gt(ZERO)
			? `${formatADXPretty(totalRewardADX)} ADX, ${formatDAIPretty(
					totalRewardDAI
			  )} DAI`
			: `${formatADXPretty(totalRewardADX)} ADX`
	})
}
