import React from "react"
import { Box } from "@material-ui/core"
import RewardCard from "./RewardCard"
import StatsCard from "./StatsCard"
import { formatADXPretty, getADXInUSDFormatted } from "../helpers/formatting"
import { useTranslation } from "react-i18next"

export default function UserData({ stats, prices, onClaimRewards, onRestake }) {
	const { t } = useTranslation()
	const {
		tomPoolStats,
		rewardChannels,
		connectedWalletAddress,
		totalRewardADX,
		totalRewardDAI,
		userBonds
	} = stats

	const identityChannels = rewardChannels.filter(
		channel => channel.claimFrom !== connectedWalletAddress
	)

	return (
		<Box width={1}>
			<Box mb={1.5}>
				{StatsCard({
					size: "large",
					loaded: stats.loaded,
					title: t("userData.myAdxBalance"),
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

			<Box mb={1.5}>
				{StatsCard({
					loaded: stats.loaded,
					title: t("userData.onWallet"),
					titleInfo: t("userData.onWalletInfo"),
					subtitle: stats.userBalance
						? formatADXPretty(stats.userBalance) + " ADX"
						: "",
					extra: getADXInUSDFormatted(prices, stats.userBalance)
				})}
			</Box>

			<Box mb={1.5}>
				{StatsCard({
					loaded: stats.loaded,
					title: t("userData.activeStake"),
					titleInfo: t("userData.activeStakeInfo", {
						apy: (tomPoolStats.totalAPY * 100).toFixed(2)
					}),
					subtitle: formatADXPretty(stats.userTotalStake) + " ADX",
					extra: getADXInUSDFormatted(prices, stats.userTotalStake)
				})}
			</Box>

			<Box>
				{RewardCard({
					prices,
					rewardChannels: identityChannels,
					userBonds,
					totalRewardADX,
					totalRewardDAI,
					onClaimRewards,
					onRestake
				})}
			</Box>
		</Box>
	)
}
