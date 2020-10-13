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
import Tooltip from "./Tooltip"
import { formatAmountPretty, formatADXPretty } from "../helpers/formatting"
import AppContext from "../AppContext"
import { DEPOSIT_POOLS, ZERO, UNBOND_DAYS } from "../helpers/constants"
import { getWithdrawActionBySelectedRewardChannels, restake } from "../actions"
import ConfirmationDialog from "./ConfirmationDialog"

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
	const [reStakeOpen, setReStakeOpen] = useState(false)
	// TODO: Claim confirm dialog
	// const [claimOpen, setClaimOpen] = useState(false)

	const disableActionsMsg = !chosenWalletType.name
		? "Connect wallet"
		: !loyaltyPoolStats.loaded || !tomPoolStats.loaded
		? "Loading data"
		: !rewards.length
		? "No rewards"
		: !Object.values(selected).filter(x => x).length
		? "Nothing selected"
		: ""

	const disableReStakeMsg = !!disableActionsMsg
		? disableActionsMsg
		: Object.entries(selected).some(
				([id, isSelected]) => isSelected && !id.startsWith("tom_incentive")
		  )
		? "Not supported rewards selected - only ADX incentive rewards can be re-staked"
		: ""

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

	const onReStake = async () => {
		await wrapDoingTxns(
			restake.bind(null, chosenWalletType, {
				// NOTE: now only tom channels are valid for re-stake at the moment
				// TODO: update when more pools
				rewardChannels: rewards
					.filter(x => selected[x.id])
					.map(x => x.rewardChannel),
				userBonds: tomPoolStats.userBonds
			})
		)()
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
					{/* TODO: Confirm */}
					<Box display="flex" flexDirection="row">
						<Box m={1}>
							<Tooltip title={disableActionsMsg}>
								<Box display="inline-block">
									<Button
										id="btn-rewards-page-claim"
										variant="contained"
										color="primary"
										onClick={onClaim}
										disabled={!!disableActionsMsg}
									>
										{`Claim`}
									</Button>
								</Box>
							</Tooltip>
						</Box>
						<Box m={1}>
							<Tooltip title={disableReStakeMsg}>
								<Box display="inline-block">
									<Button
										id="btn-rewards-page-re-stake"
										variant="contained"
										color="secondary"
										onClick={() => setReStakeOpen(true)}
										disabled={!!disableReStakeMsg}
									>
										{`RE-STAKE`}
									</Button>
								</Box>
							</Tooltip>
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

				{ConfirmationDialog({
					isOpen: reStakeOpen,
					onDeny: () => setReStakeOpen(false),
					onConfirm: () => {
						onReStake()
					},
					confirmActionName: "Re-stake",
					content: (
						<>
							Are you sure you want to re-stake your earnings of{" "}
							{formatADXPretty(totalAmountsSelected["ADX"] || ZERO)} ADX?
							<br />
							<br />
							Please be aware that this means that this amount will be locked up
							for at least {UNBOND_DAYS} days.
							<br />
							{!stats.userBonds.find(x => x.status === "Active")
								? "Your bond will be re-activated, meaning that your request to unbond will be cancelled but it will start earning rewards again."
								: ""}
						</>
					)
				})}
			</Box>
		</Box>
	)
}
