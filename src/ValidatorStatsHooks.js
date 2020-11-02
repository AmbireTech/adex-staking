import { useEffect, useState } from "react"

import { POOLS } from "./helpers/constants"

import { getValidatorStatsByPoolId } from "./actions/pools"

const poolsSrc = POOLS.filter(x => x.selectable).map(x => ({
	value: x.id,
	label: x.label,
	pool: x
}))

export default function ValidatorStatsHooks() {
	const [poolId, setPoolId] = useState(poolsSrc[0].value)
	const [pool, setPool] = useState(poolsSrc[0].pool)
	const [statsByPoolId, setStatsByPoolId] = useState({})
	const [stats, setStats] = useState({})

	const loaded = !!Object.keys(stats).length

	useEffect(() => {
		if (!statsByPoolId[poolId]) {
			const newStats = { ...setStatsByPoolId }
			newStats[poolId] = {}
			setStatsByPoolId(newStats)
			setStats(newStats[poolId])

			const updatePoolStats = async () => {
				const stats = await getValidatorStatsByPoolId(poolId)()
				const newStats = { ...setStatsByPoolId }
				newStats[poolId] = stats
				setStatsByPoolId(newStats)
				setStats(newStats[poolId])
			}
			updatePoolStats()
		}
	}, [poolId, statsByPoolId])

	return {
		loaded,
		poolId,
		setPoolId,
		pool,
		setPool,
		statsByPoolId,
		setStatsByPoolId,
		stats,
		setStats
	}
}
