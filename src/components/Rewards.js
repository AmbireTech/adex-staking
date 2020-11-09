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
	Button,
	SvgIcon
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import Tooltip from "./Tooltip"
import {
	formatAmountPretty,
	formatADXPretty,
	getDAIInUSD,
	getADXInUSD,
	getUSDFormatted
} from "../helpers/formatting"
import AppContext from "../AppContext"
import {
	// DEPOSIT_POOLS,
	ZERO,
	UNBOND_DAYS
} from "../helpers/constants"
import { getWithdrawActionBySelectedRewardChannels, restake } from "../actions"
import { ReactComponent as GiftIcon } from "./../resources/gift-ic.svg"
import ConfirmationDialog from "./ConfirmationDialog"
import StatsCard from "./StatsCard"
import { AmountText } from "./cardCommon"
import { useTranslation, Trans } from "react-i18next"

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
	const {
		// loyaltyPoolStats,
		tomPoolStats
	} = stats
	const [selected, setSelected] = useState({})
	const [totalAmountsSelected, setTotalAmountsSelected] = useState({})
	const [reStakeOpen, setReStakeOpen] = useState(false)
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

	const disableReStakeMsg = !!disableActionsMsg
		? disableActionsMsg
		: selectedRewards.some(x => !x.id.startsWith("tom_incentive"))
		? t("rewards.reStakeUnsupportedSelected")
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

			const rewards = tomRewardChannels.map(channel => {
				const rewardData = {
					id: `tom_${channel.type}_${new Date(
						channel.periodStart
					).getTime()}_${new Date(channel.periodEnd).getTime()}`,
					name: t("rewards.poolName", {
						pool: "Tom",
						type: t(`common.${channel.type}`),
						extra:
							channel.type === "fees"
								? new Date(channel.periodEnd).toLocaleString("default", {
										month: "long"
								  })
								: ""
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

	const onReStake = async () => {
		setSelected({})
		setTotalAmountsSelected({})
		await wrapDoingTxns(
			restake.bind(null, chosenWalletType, {
				// NOTE: now only tom channels are valid for re-stake at the moment
				// TODO: update when more pools
				rewardChannels: selectedRewards.map(x => x.rewardChannel),
				userBonds: tomPoolStats.userBonds
			})
		)()
	}

	const totalSelectedLabel = totalAmountsLabel(totalAmountsSelected)
	const totalRewardsLabel = totalAmountsLabel(totalRewardsAmounts) || "0.00"
	const totalOutstandingRewardsLabel =
		totalAmountsLabel(totalOutstandingRewardsAmounts) || "0.00"

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
					<AmountText
						text={`${formatAmountPretty(reward.amount, reward.currency)} ${
							reward.currency
						}`}
						fontSize={17}
					/>
				</TableCell>
				<TableCell align="right">
					<AmountText
						text={`${formatAmountPretty(
							reward.outstandingReward,
							reward.currency
						)} ${reward.currency}`}
						fontSize={17}
					/>
				</TableCell>
				<TableCell align="right">{`${(reward.currentAPY * 100).toFixed(
					2
				)} %`}</TableCell>
			</TableRow>
		)
	}

	return (
		<Box mt={2}>
			<Box m={1} color="text.main">
				<Typography variant="h5" gutterBottom>
					{t("common.rewards")}
				</Typography>
			</Box>
			<Box display="flex" flexDirection="row">
				<Box
					m={1}
					p={2}
					bgcolor="background.darkerPaper"
					boxShadow={25}
					display="flex"
					flexDirection="row"
					alignItems="center"
				>
					<Box m={1} fontSize={55}>
						<SvgIcon fontSize="inherit" color="primary">
							<GiftIcon width="100%" height="100%" />
						</SvgIcon>
					</Box>
					<Box m={1}>
						{StatsCard({
							loaded,
							title: t("rewards.total"),
							subtitle: totalRewardsLabel,
							extra: getUSDFormatted(totalRewardsInUsd),
							multilineLinesAmounts: true
						})}
					</Box>
				</Box>

				<Box m={1} p={2} bgcolor="background.darkerPaper" boxShadow={25}>
					<Box m={1}>
						{StatsCard({
							loaded,
							title: t("rewards.unclaimed"),
							subtitle: totalOutstandingRewardsLabel,
							extra: getUSDFormatted(totalOutstandingRewardsInUsd),
							multilineLinesAmounts: true
						})}
					</Box>
				</Box>
			</Box>

			<Box m={1} bgcolor="background.darkerPaper" boxShadow={25}>
				<Box
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
					<Box display="flex" flexDirection="row">
						<Box m={1}>
							<Tooltip title={disableActionsMsg}>
								<Box display="inline-block">
									<Button
										id="btn-rewards-page-claim"
										variant="contained"
										color="primary"
										onClick={() => setClaimOpen(true)}
										disabled={!!disableActionsMsg}
									>
										{t("common.claim")}
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
										{t("common.reStake")}
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
									<TableCell>{t("rewards.name")}</TableCell>
									<TableCell align="right">{t("rewards.total")}</TableCell>
									<TableCell align="right">{t("rewards.unclaimed")}</TableCell>
									<TableCell align="right">{t("common.currentAPY")}</TableCell>
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
								{t("rewards.tableInfo")}
							</Alert>
						</Box>
					)}
				</Box>

				{ConfirmationDialog({
					isOpen: reStakeOpen,
					onDeny: () => setReStakeOpen(false),
					onConfirm: () => {
						setReStakeOpen(false)
						onReStake()
					},
					confirmActionName: t("common.reStake"),
					content: (
						<Trans
							i18nKey="dialogs.reStakeConfirmation"
							values={{
								amount: formatADXPretty(totalAmountsSelected["ADX"] || ZERO),
								currency: "ADX",
								unbondDays: UNBOND_DAYS,
								extraInfo: !stats.userBonds.find(x => x.status === "Active")
									? t("dialogs.reActivatingInfo")
									: ""
							}}
							components={{
								box: <Box mb={2}></Box>
							}}
						/>
					)
				})}

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
