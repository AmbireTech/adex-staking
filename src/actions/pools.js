import { DEPOSIT_POOLS, POOLS, ZERO } from "../helpers/constants"
import {
	onLoyaltyPoolDeposit,
	onLoyaltyPoolWithdraw
} from "./loyaltyPoolActions"
import { claimRewards } from "./actions"
import { fetchJSON } from "../helpers/fetch"
import { formatDAI } from "../helpers/formatting"

const MARKET_URL = "https://market.adex.network"
const TOM_URL = "https://tom.adex.network"

export const getDepositPool = poolId => DEPOSIT_POOLS.find(x => x.id === poolId)

export const getDepositActionByPoolId = poolId => {
	if (poolId === DEPOSIT_POOLS[0].id) {
		return onLoyaltyPoolDeposit
	}
}

export const getWithdrawActionByPoolId = poolId => {
	if (poolId === DEPOSIT_POOLS[0].id) {
		return onLoyaltyPoolWithdraw
	}
	if (poolId === POOLS[0].id) {
		return claimRewards
	}
}

export const getPoolStatsByPoolId = (stats, poolId) => {
	if (poolId === DEPOSIT_POOLS[0].id) {
		return stats.loyaltyPoolStats
	}
	if (poolId === POOLS[0].id) {
		return stats.tomPoolStats
	}
}

export const getWithdrawActionBySelectedRewardChannels = (
	rewards,
	chosenWalletType,
	stats
) => {
	const actions = Object.entries(
		rewards.reduce((byPool, r) => {
			const { poolId } = r
			byPool[poolId] = [...(byPool[poolId] || []), r]
			return byPool
		}, {})
	).map(([poolId, rwds]) => {
		if (poolId === DEPOSIT_POOLS[0].id) {
			return onLoyaltyPoolWithdraw.bind(
				null,
				stats,
				chosenWalletType,
				rwds[0].outstandingReward
			)
		}
		if (poolId === POOLS[0].id) {
			const rewardChannels = rwds.map(r => r.rewardChannel)
			return claimRewards.bind(null, chosenWalletType, rewardChannels)
		}
		return () => {}
	})

	return actions
}

const sumValidatorAnalyticsResValue = res =>
	Object.values(res.aggr || {}).reduce((a, b) => a.add(b.value), ZERO)

const toChartData = (data, valueLabel, currency) => {
	return (data.aggr || []).reduce(
		(data, { time, value }) => {
			data.labels.push(new Date(time).toLocaleString())
			data.datasets.push(parseFloat(currency ? formatDAI(value) : value))

			return data
		},
		{ labels: [], datasets: [], valueLabel, currency }
	)
}

export const getValidatorTomStats = async () => {
	const channels = await fetchJSON(MARKET_URL + "/campaigns?all")
	const { totalDeposits, totalPayouts } = channels.reduce(
		(amounts, { depositAmount, status }) => {
			amounts.totalDeposits = amounts.totalDeposits.add(depositAmount)
			amounts.totalPayouts = amounts.totalPayouts.add(
				Object.values(status.lastApprovedBalances || {}).reduce(
					(a, b) => a.add(b),
					ZERO
				)
			)

			return amounts
		},
		{ totalDeposits: ZERO, totalPayouts: ZERO }
	)

	const dailyPayoutsData = await fetchJSON(
		TOM_URL + "/analytics?metric=eventPayouts&timeframe=day"
	)
	const yearlyTransactionsData = await fetchJSON(
		TOM_URL + "/analytics?metric=eventCounts&timeframe=year"
	)

	return {
		totalDeposits,
		totalPayouts,
		dailyPayoutsData: toChartData(dailyPayoutsData, "stats.labelPayout", "DAI"),
		dailyPayoutsVolume: sumValidatorAnalyticsResValue(dailyPayoutsData),
		yearlyTransactionsData: toChartData(
			yearlyTransactionsData,
			"stats.labelTransactions"
		),
		yearlyTransactions: sumValidatorAnalyticsResValue(yearlyTransactionsData)
	}
}

export const getValidatorStatsByPoolId = poolId => {
	if (poolId === POOLS[0].id) {
		return getValidatorTomStats
	}
}
