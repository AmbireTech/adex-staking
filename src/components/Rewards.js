import React, { useContext, useEffect, useState } from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	Typography,
	Checkbox
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"

import { formatAmountPretty } from "../helpers/formatting"
import AppContext from "../AppContext"

export default function Rewards() {
	const { stats, chosenWalletType } = useContext(AppContext)
	const [rewards, setRewards] = useState([])
	const { loyaltyPoolStats, tomPoolStats } = stats
	const [selected, setSelected] = useState({})

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
				id: "loyalty_pool",
				name: "Loyalty pool deposit",
				amount: null,
				outstandingReward: loPoRewardADX,
				currency: "ADX",
				currentAPY: loPoCurrentAPY
			}

			const rewards = tomRewardChannels.map(channel => {
				const rewardData = {
					id: `tom_${channel.type}_${new Date(
						channel.periodStart
					).getTime()}_${new Date(channel.periodEnd).getTime()}`,
					name: `Tom - ${channel.type} ${
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

	const onSelectChange = (id, value) => {
		const newSelected = { ...selected }

		newSelected[id] = value

		setSelected(newSelected)
	}

	console.log("rewards", rewards)
	console.log("selected", selected)

	const renderRewardRow = (reward, selected) => {
		return (
			<TableRow key={reward.id}>
				<TableCell>
					<Checkbox
						checked={!!selected[reward.id]}
						onChange={ev => onSelectChange(reward.id, !!ev.target.checked)}
						inputProps={{ "aria-label": "primary checkbox" }}
					/>
				</TableCell>
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
		<Box mt={2}>
			<Box color="text.main">
				<Typography variant="h5" gutterBottom>
					{"REWARDS"}
				</Typography>
			</Box>
			<Box mt={3} bgcolor="background.darkerPaper" boxShadow={25}>
				<Box p={3}>
					<TableContainer xs={12}>
						<Table aria-label="Rewards table">
							<TableHead>
								<TableRow>
									<TableCell></TableCell>
									<TableCell>Reward name</TableCell>
									<TableCell align="right">Total rewards</TableCell>
									<TableCell align="right">Unclaimed rewards</TableCell>
									<TableCell align="right">Current APY</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{[...(rewards || [])].map(r => renderRewardRow(r, selected))}
							</TableBody>
						</Table>
					</TableContainer>

					{(!stats.loaded || !rewards.length) && (
						<Box mt={2}>
							<Alert variant="filled" severity="info">
								{`This table will show all your rewards`}
							</Alert>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}
