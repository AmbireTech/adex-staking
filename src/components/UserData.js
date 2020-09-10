import React, { useState, useEffect } from "react"
import { Box } from "@material-ui/core"
import RewardCard from "./RewardCard"
import StatsCard from "./StatsCard"
import { ZERO, PRICES_API_URL } from "../helpers/constants"
import { formatADXPretty, formatADX, getApproxAPY } from "../helpers/formatting"

export default function Dashboard({ stats, onClaimRewards, onRestake }) {
	const userTotalStake = stats.userBonds
		.filter(x => x.status === "Active")
		.map(x => x.currentAmount)
		.reduce((a, b) => a.add(b), ZERO)

	// USD values
	const [prices, setPrices] = useState({})
	const refreshPrices = () =>
		fetch(PRICES_API_URL)
			.then(r => r.json())
			.then(setPrices)
			.catch(console.error)
	useEffect(() => {
		refreshPrices()
	}, [])
	const inUSD = adxAmount => {
		if (!adxAmount) return null
		if (!prices.USD) return null
		const usdAmount = parseFloat(formatADX(adxAmount), 10) * prices.USD
		return `${usdAmount.toFixed(2)} USD`
	}

	return (
		<Box>
			<Box mb={2}>
				{StatsCard({
					loaded: stats.loaded,
					title: "My AdEx balance",
					subtitle: stats.totalBalanceADX
						? formatADXPretty(stats.totalBalanceADX) + " ADX"
						: "",
					extra: inUSD(stats.totalBalanceADX)
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
					subtitle: stats.userBalance
						? formatADXPretty(stats.userBalance) + " ADX"
						: "",
					extra: inUSD(stats.userBalance)
				})}
			</Box>

			<Box mb={2}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Active Stake",
					extra: inUSD(stats.userTotalStake),
					subtitle: formatADXPretty(stats.userTotalStake) + " ADX"
				})}
			</Box>

			<Box mb={2}>
				{RewardCard({
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
