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
					title: "Your balance",
					subtitle: stats.userBalance
						? formatADXPretty(stats.userBalance) + " ADX"
						: "",
					extra: inUSD(stats.userBalance)
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
					title: "Your total active stake",
					extra: inUSD(userTotalStake),
					subtitle: formatADXPretty(userTotalStake) + " ADX"
				})}
			</Box>

			<Box mb={2}>
				{StatsCard({
					loaded: stats.loaded,
					title: "Total ADX staked",
					extra:
						!stats.loaded || stats.userBonds.length
							? inUSD(stats.totalStake)
							: `Earning ${(getApproxAPY(null, stats.totalStake) * 100).toFixed(
									2
							  )}% APY`,
					subtitle: formatADXPretty(stats.totalStake) + " ADX"
				})}
			</Box>
			<Box mb={2}>
				{RewardCard({
					rewardChannels: stats.rewardChannels,
					userBonds: stats.userBonds,
					onClaimRewards,
					onRestake
				})}
			</Box>
		</Box>
	)
}
