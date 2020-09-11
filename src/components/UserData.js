import React from "react"
import { Box } from "@material-ui/core"
import RewardCard from "./RewardCard"
import StatsCard from "./StatsCard"
import {
	formatADXPretty,
	getApproxAPY,
	getADXInUSDFormatted
} from "../helpers/formatting"

export default function UserData({ stats, prices, onClaimRewards, onRestake }) {
	return (
		<Box>
			<Box mb={2}>
				{StatsCard({
					size: "large",
					loaded: stats.loaded,
					title: "MY ADX BALANCE",
					subtitle: stats.totalBalanceADX
						? formatADXPretty(stats.totalBalanceADX) + " ADX"
						: "",

					extra: getADXInUSDFormatted(prices, stats.totalBalanceADX)
					/*actions: (<Button
							size="small"
							variant="contained"
							color="secondary"
							disabled={true}
						>upgrade</Button>)*/
				})}
			</Box>

			<Box mb={2}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Available on wallet",
					titleInfo: "Amount available on your wallet",
					subtitle: stats.userBalance
						? formatADXPretty(stats.userBalance) + " ADX"
						: "",
					extra: getADXInUSDFormatted(prices, stats.userBalance)
				})}
			</Box>

			<Box mb={2}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Active Stake",
					titleInfo: `Active, earning ${(
						getApproxAPY(null, stats.totalStake) * 100
					).toFixed(2)}% APY`,
					subtitle: formatADXPretty(stats.userTotalStake) + " ADX",
					extra: getADXInUSDFormatted(prices, stats.userTotalStake)
				})}
			</Box>

			<Box mb={2}>
				{RewardCard({
					prices,
					rewardChannels: stats.rewardChannels,
					userBonds: stats.userBonds,
					totalRewardADX: stats.totalRewardADX,
					totalRewardDAI: stats.totalRewardDAI,
					onClaimRewards,
					onRestake
				})}
			</Box>
		</Box>
	)
}
