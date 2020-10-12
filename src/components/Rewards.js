import React, { useContext, useEffect, useState } from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { formatAmountPretty } from "../helpers/formatting"
import AppContext from "../AppContext"

export default function Rewards() {
	const [rewards, setRewards] = useState([])
	const { stats, chosenWalletType } = useContext(AppContext)
	const { loyaltyPoolStats, tomPoolStats } = stats

	const disableActionsMsg = !chosenWalletType.name
		? "Connect wallet"
		: !loyaltyPoolStats.loaded || !tomPoolStats.loaded

	useEffect(() => {
		const {
			rewardChannels: tomRewardChannels,
			userDataLoaded: tomUserDataLoaded
		} = tomPoolStats

		const {
			currentAPY: loPoCurrentAPY,
			rewardADX: loPoRewardADX,
			userDataLoaded: loPoUserDataLoaded
		} = loyaltyPoolStats

		if (tomUserDataLoaded && loPoUserDataLoaded) {
			const loPoReward = {
				name: "Loyalty pool deposit",
				amount: null,
				outstandingReward: loPoRewardADX,
				currency: "ADX",
				currentAPY: loPoCurrentAPY
			}

			const rewards = tomRewardChannels.map(channel => {
				const rewardData = {
					name: `Tom - ${channel.type} 
						${
							channel.type === "fees"
								? new Date(channel.periodEnd).toLocaleString("default", {
										month: "long"
								  })
								: ""
						} `,
					amount: channel.amount,
					outstandingReward: channel.outstandingReward,
					currency: channel.type === "fees" ? "DAI" : "ADX",
					currentAPY: channel.currentAPY
				}

				return rewardData
			})

			setRewards([loPoReward, ...rewards])
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loyaltyPoolStats, tomPoolStats])

	const renderRewardRow = reward => {
		return (
			<TableRow key={reward.name}>
				<TableCell>
					<Box>{reward.name}</Box>
				</TableCell>
				<TableCell align="right">
					{formatAmountPretty(reward.amount, reward.currency) || "N/A"}{" "}
					{reward.currency}
				</TableCell>
				<TableCell align="right">
					{formatAmountPretty(reward.outstandingReward, reward.currency)}{" "}
					{reward.currency}
				</TableCell>
				<TableCell align="right">{reward.currentAPY}</TableCell>
				<TableCell align="right">
					{/* {reward.actions.map((action, index) => (
						<Box key={index} display="inline-block" m={0.5}>
							{action}
						</Box>
					))} */}
				</TableCell>
			</TableRow>
		)
	}

	return (
		<Box>
			<Box>
				<TableContainer xs={12}>
					<Table aria-label="Rewards table">
						<TableHead>
							<TableRow>
								<TableCell>Reward nae</TableCell>
								<TableCell align="right">Total rewards</TableCell>
								<TableCell align="right">Unclaimed rewards</TableCell>
								<TableCell align="right">Current APY</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{[...(rewards || [])].map(renderRewardRow)}</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	)
}
