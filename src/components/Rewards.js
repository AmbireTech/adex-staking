import React, { useContext, useEffect, useState } from "react"
import {
	TableRow,
	Box,
	TableBody,
	Typography,
	Checkbox,
	Button,
	SvgIcon
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import Tooltip from "./Tooltip"
import {
	formatAmountPretty,
	// formatADXPretty,
	getDAIInUSD,
	getADXInUSD,
	getUSDFormatted
} from "../helpers/formatting"
import AppContext from "../AppContext"
import {
	// DEPOSIT_POOLS,
	ZERO,
	iconByPoolId
	// UNBOND_DAYS
} from "../helpers/constants"
import { getWithdrawActionBySelectedRewardChannels } from "../actions"
import { ReactComponent as GiftIcon } from "./../resources/gift-ic.svg"
import ConfirmationDialog from "./ConfirmationDialog"
import StatsCard from "./StatsCard"
import { AmountText } from "./cardCommon"
import WithRouterLink from "./WithRouterLink"
import {
	useTranslation
	// Trans
} from "react-i18next"
import CustomTable, { StyledTableCell, StyledTableHead } from "./CustomTable"
import CustomButton from "./CustomButton"

const RRButton = WithRouterLink(Button)

const getTotalSelectedRewards = (rewards, selected, getTotal) => {
	return rewards
		.filter(r => (selected === "all" ? true : selected[r.id]))
		.reduce((amounts, r) => {
			amounts[r.currency] = (amounts[r.currency] || ZERO).add(
				r[getTotal ? "amount" : "outstandingReward"] || ZERO
			)

			return amounts
		}, {})
}

const totalAmountsLabel = amounts =>
	Object.entries(amounts)
		.map(
			([currency, amount]) =>
				`${formatAmountPretty(amount, currency)} ${currency}`
		)
		.join("; ")

export default function Rewards() {
	const { t } = useTranslation()

	const { stats, chosenWalletType, wrapDoingTxns, prices } = useContext(
		AppContext
	)
	const [rewards, setRewards] = useState([])
	const { tomStakingV5PoolStats, loyaltyPoolStats, tomPoolStats } = stats
	const [selected, setSelected] = useState({})
	const [totalAmountsSelected, setTotalAmountsSelected] = useState({})
	const [claimOpen, setClaimOpen] = useState(false)

	const totalRewardsAmounts = getTotalSelectedRewards(rewards, "all", true)
	const totalOutstandingRewardsAmounts = getTotalSelectedRewards(rewards, "all")

	const totalRewardsInUsd =
		getADXInUSD(prices, totalRewardsAmounts["ADX"] || ZERO) +
		getDAIInUSD(totalRewardsAmounts["DAI"] || ZERO)

	const totalOutstandingRewardsInUsd =
		getADXInUSD(prices, totalOutstandingRewardsAmounts["ADX"] || ZERO) +
		getDAIInUSD(totalOutstandingRewardsAmounts["DAI"] || ZERO)

	const selectedRewards = rewards.filter(x => selected[x.id])
	const loaded =
		// loyaltyPoolStats.userDataLoaded &&
		tomPoolStats.userDataLoaded

	const disableActionsMsg = !chosenWalletType.name
		? t("common.connectWallet")
		: !loaded
		? t("common.loadingData")
		: !rewards.length
		? t("rewards.noRewards")
		: !selectedRewards.length
		? t("common.noSelection")
		: ""

	useEffect(() => {
		const {
			rewardChannels: tomRewardChannels,
			userDataLoaded: tomUserDataLoaded
		} = tomPoolStats

		// const {
		// 	currentAPY: loPoCurrentAPY,
		// 	rewardADX: loPoRewardADX,
		// 	userDataLoaded: loPoUserDataLoaded
		// } = loyaltyPoolStats

		if (
			tomUserDataLoaded
			// && loPoUserDataLoaded
		) {
			// const loPoReward = {
			// 	id: "loyalty_pool",
			// 	name: t("rewards.loPoReward"),
			// 	amount: loPoRewardADX,
			// 	outstandingReward: loPoRewardADX,
			// 	currency: "ADX",
			// 	currentAPY: loPoCurrentAPY,
			// 	poolId: DEPOSIT_POOLS[0].id
			// }

			const rewards = tomRewardChannels.map((channel, index) => {
				const startDate = new Date(channel.periodStart)
				const endDate = new Date(channel.periodEnd)
				const rewardData = {
					id: `tom_${
						channel.type
					}_${startDate.getTime()}_${endDate.getTime()}_${channel._id}`,
					name: t("rewards.poolName", {
						pool: "Tom",
						type: t(`common.${channel.type}`),
						extra:
							channel.type === "fees"
								? `${endDate.toLocaleString("default", {
										month: "long"
								  })} ${endDate.getFullYear()}`
								: `${startDate.getMonth() +
										1}.${startDate.getFullYear()} - ${endDate.getMonth() +
										1}.${endDate.getFullYear()}`
					}),
					amount: channel.amount,
					outstandingReward: channel.outstandingReward,
					currency: channel.type === "fees" ? "DAI" : "ADX",
					currentAPY: channel.currentAPY,
					poolId: channel.poolId,
					rewardChannel: channel
				}

				return rewardData
			})

			setRewards([
				// loPoReward,
				...rewards
			])
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// loyaltyPoolStats,
		tomPoolStats
	])

	const onSelectChange = (id, value) => {
		const newSelected = { ...selected }
		newSelected[id] = value

		const totalAmountSelected = getTotalSelectedRewards(rewards, newSelected)

		setTotalAmountsSelected(totalAmountSelected)
		setSelected(newSelected)
	}

	const massSelectChange = newSelected => {
		const totalAmountSelected = getTotalSelectedRewards(rewards, newSelected)

		setTotalAmountsSelected(totalAmountSelected)
		setSelected(newSelected)
	}

	const onClaim = async () => {
		setSelected({})
		setTotalAmountsSelected({})
		const actions = getWithdrawActionBySelectedRewardChannels(
			selectedRewards,
			chosenWalletType,
			stats
		)

		for (let i = 0; i < actions.length; i++) {
			await wrapDoingTxns(actions[i])()
		}
	}

	const totalSelectedLabel = totalAmountsLabel(totalAmountsSelected)
	const totalRewardsLabel = totalAmountsLabel(totalRewardsAmounts) || "0.00"
	const totalOutstandingRewardsLabel =
		totalAmountsLabel(totalOutstandingRewardsAmounts) || "0.00"

	const renderRewardRow = (reward, selected) => {
		return (
			<TableRow key={reward.id}>
				<StyledTableCell>
					<Checkbox
						disabled={false}
						// disabled={reward.outstandingReward.isZero()}
						checked={!!selected[reward.id]}
						onChange={ev => onSelectChange(reward.id, ev.target.checked)}
						inputProps={{ "aria-label": "primary checkbox" }}
					/>
				</StyledTableCell>
				<StyledTableCell>
					<Box>{reward.name}</Box>
				</StyledTableCell>
				<StyledTableCell>
					<AmountText
						text={`${formatAmountPretty(reward.amount, reward.currency)} ${
							reward.currency
						}`}
						fontSize={17}
					/>
				</StyledTableCell>
				<StyledTableCell>
					<AmountText
						text={`${formatAmountPretty(
							reward.outstandingReward,
							reward.currency
						)} ${reward.currency}`}
						fontSize={17}
					/>
				</StyledTableCell>
				<StyledTableCell>{`${(reward.currentAPY * 100).toFixed(
					2
				)} %`}</StyledTableCell>
			</TableRow>
		)
	}

	const renderDepositRewardsRow = ({ deposit }) => {
		const PoolIcon = iconByPoolId(deposit)

		return (
			<TableRow key={deposit.poolId}>
				<StyledTableCell>
					{PoolIcon && (
						<Box mr={1}>
							<Box
							// classes={{ root: classes.iconBox }}
							>
								<SvgIcon fontSize="large" color="inherit">
									<PoolIcon width="100%" height="100%" />
								</SvgIcon>
							</Box>
						</Box>
					)}
				</StyledTableCell>
				<StyledTableCell>
					<Box>{t(deposit.label)}</Box>
				</StyledTableCell>
				<StyledTableCell>
					<AmountText
						text={`${formatAmountPretty(deposit.totalRewards, "ADX")} ADX`}
						fontSize={17}
					/>
				</StyledTableCell>
				<StyledTableCell>
					<RRButton to={{ pathname: "/stakings" }}>
						{t("rewards.seeDetailsBtn")}
					</RRButton>
				</StyledTableCell>
				<StyledTableCell>{`${(deposit.currentAPY * 100).toFixed(
					2
				)} %`}</StyledTableCell>
			</TableRow>
		)
	}

	return (
		<Box mt={2}>
			<Box m={1} mb={3} color="text.secondaryLight">
				<Typography variant="h5" gutterBottom>
					{t("common.rewards")}
				</Typography>
			</Box>
			{/* <Box display="flex" flexDirection="row">
				<Box
					m={1}
					py={3}
					px={4}
					bgcolor="background.paper"
					boxShadow={25}
					display="flex"
					flexDirection="row"
					alignItems="center"
				>
					<Box m={1} mr={3} fontSize={35}>
						<SvgIcon fontSize="inherit" color="primary">
							<GiftIcon width="100%" height="100%" />
						</SvgIcon>
					</Box>
					<Box m={1}>
						{StatsCard({
							loaded,
							title: t("rewards.total"),
							subtitleLarge: totalRewardsLabel,
							extra: getUSDFormatted(totalRewardsInUsd),
							multilineLinesAmounts: true
						})}
					</Box>
				</Box>

				<Box m={1} p={2} bgcolor="background.paper" boxShadow={25}>
					<Box m={1} py={3} px={4}>
						{StatsCard({
							loaded,
							title: t("rewards.unclaimed"),
							subtitle: totalOutstandingRewardsLabel,
							extra: getUSDFormatted(totalOutstandingRewardsInUsd),
							multilineLinesAmounts: true
						})}
					</Box>
				</Box>
				{/* <Box
					p={2}
					display="flex"
					flexDirection="row"
					justifyContent="space-between"
				>
					<Box m={1}>
						{!!Object.keys(totalAmountsSelected).length && (
							<Fragment>
								<Typography type="h5">{t("rewards.totalSelected")}:</Typography>
								<Typography type="h4">{totalSelectedLabel}</Typography>
							</Fragment>
						)}
					</Box>
				</Box> */}
			{/* </Box> */}

			<Box maxWidth="56rem">
				<Box p={2}>
					<CustomTable aria-label="Rewards table" xs={12}>
						<StyledTableHead>
							<TableRow>
								<StyledTableCell>
									<Checkbox
										disabled={!rewards.length}
										// disabled={reward.outstandingReward.isZero()}
										checked={
											rewards.length &&
											rewards.length ===
												Object.values(selected).filter(key => key).length
										}
										onChange={() => {
											const value =
												Object.values(selected).filter(key => key).length === 0
											const newSelected = Object.fromEntries(
												rewards.map(reward => [reward.id, value])
											)
											massSelectChange(newSelected)
										}}
										inputProps={{ "aria-label": "primary checkbox" }}
									/>
								</StyledTableCell>
								<StyledTableCell>{t("rewards.name")}</StyledTableCell>
								<StyledTableCell>{t("rewards.total")}</StyledTableCell>
								<StyledTableCell>{t("rewards.unclaimed")}</StyledTableCell>
								<StyledTableCell>{t("common.currentAPY")}</StyledTableCell>
							</TableRow>
						</StyledTableHead>
						<TableBody>
							{tomStakingV5PoolStats.totalRewards &&
								!tomStakingV5PoolStats.totalRewards.isZero() &&
								renderDepositRewardsRow({
									deposit: {
										totalRewards: tomStakingV5PoolStats.totalRewards,
										currentAPY: tomStakingV5PoolStats.currentAPY,
										poolId: "adex-staking-pool",
										label: "common.tomStakingPool"
									}
								})}
							{loyaltyPoolStats.totalRewards &&
								!loyaltyPoolStats.totalRewards.isZero() &&
								renderDepositRewardsRow({
									deposit: {
										totalRewards: loyaltyPoolStats.totalRewards,
										currentAPY: loyaltyPoolStats.currentAPY,
										poolId: "adex-loyalty-pool",
										label: "common.loPo"
									}
								})}
							{[...(rewards || [])].map(r => renderRewardRow(r, selected))}
						</TableBody>
					</CustomTable>

					{(!stats.loaded || !rewards.length) && (
						<Box mt={2}>
							<Alert variant="filled" severity="info">
								{t("rewards.tableInfo")}
							</Alert>
						</Box>
					)}
				</Box>

				<Box display="flex" flexDirection="row" justifyContent="flex-end">
					<Box m={1}>
						<Tooltip title={disableActionsMsg}>
							<Box display="inline-block">
								<CustomButton
									id="btn-rewards-page-claim"
									btnType="outline"
									onClick={() => setClaimOpen(true)}
									disabled={!!disableActionsMsg}
								>
									{t("common.claim")}
								</CustomButton>
							</Box>
						</Tooltip>
					</Box>
				</Box>

				{ConfirmationDialog({
					isOpen: claimOpen,
					onDeny: () => setClaimOpen(false),
					onConfirm: () => {
						setClaimOpen(false)
						onClaim()
					},
					confirmActionName: t("common.claim"),
					content: (
						<>
							<Box mb={1}>
								<Typography>{t("dialogs.claimConfirmation")}</Typography>
							</Box>
							{selectedRewards.map(reward => (
								<Box key={reward.id}>
									{reward.name}
									{": "}
									{formatAmountPretty(
										reward.outstandingReward,
										reward.currency
									)}{" "}
									{reward.currency}
								</Box>
							))}

							<Box mt={1}>
								<Typography>
									{t("dialogs.forTotal", { total: totalSelectedLabel })}
								</Typography>
							</Box>
						</>
					)
				})}
			</Box>
		</Box>
	)
}
