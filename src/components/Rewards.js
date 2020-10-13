import React, { Fragment, useContext, useEffect, useState } from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	Typography,
	Checkbox,
	Button
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"

import { formatAmountPretty } from "../helpers/formatting"
import AppContext from "../AppContext"
import { DEPOSIT_POOLS, ZERO } from "../helpers/constants"
import { getWithdrawActionBySelectedRewardChannels } from "../actions"

const getTotalSelectedOutstandingRewards = (rewards, selected) => {
	return rewards
		.filter(r => selected[r.id])
		.reduce((amounts, r) => {
			amounts[r.currency] = (amounts[r.currency] || ZERO).add(
				r.outstandingReward
			)

			return amounts
		}, {})
}

export default function Rewards() {
	const { stats, chosenWalletType, wrapDoingTxns } = useContext(AppContext)
	const [rewards, setRewards] = useState([])
	const { loyaltyPoolStats, tomPoolStats } = stats
	const [selected, setSelected] = useState({})
	const [totalAmountsSelected, setTotalAmountsSelected] = useState({})

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
				currentAPY: loPoCurrentAPY,
				poolId: DEPOSIT_POOLS[0].id
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
					currentAPY: channel.currentAPY,
					poolId: channel.poolId,
					rewardChannel: channel
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

		const totalAmountSelected = getTotalSelectedOutstandingRewards(
			rewards,
			newSelected
		)

		setTotalAmountsSelected(totalAmountSelected)
		setSelected(newSelected)
	}

	console.log("rewards", rewards)
	console.log("selected", selected)

	const onClaim = async () => {
		const selectedRewards = rewards.filter(r => selected[r.id])
		const actions = getWithdrawActionBySelectedRewardChannels(
			selectedRewards,
			chosenWalletType,
			stats
		)

		for (let i = 0; i < actions.length; i++) {
			await wrapDoingTxns(actions[i])()
		}
	}

	const renderRewardRow = (reward, selected) => {
		return (
			<TableRow key={reward.id}>
				<TableCell>
					<Checkbox
						disabled={reward.outstandingReward.isZero()}
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
				<Box
					p={2}
					display="flex"
					flexDirection="row"
					justifyContent="space-between"
				>
					<Box m={1}>
						{!!Object.keys(totalAmountsSelected).length && (
							<Fragment>
								<Typography type="h5">{`Total selected:`}</Typography>
								<Typography type="h4">
									{Object.entries(totalAmountsSelected)
										.map(
											([currency, amount]) =>
												`${formatAmountPretty(amount, currency)} ${currency}`
										)
										.join("; ")}
								</Typography>
							</Fragment>
						)}
					</Box>
					<Box display="flex" flexDirection="row">
						<Box m={1}>
							<Button variant="contained" color="primary" onClick={onClaim}>
								Claim
							</Button>
						</Box>
						<Box m={1}>
							<Button variant="contained" color="secondary">
								RE-STAKE
							</Button>
						</Box>
					</Box>
				</Box>
				<Box p={2}>
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
