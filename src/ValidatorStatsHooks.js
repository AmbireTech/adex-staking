import { useEffect, useState } from "react"
import { getValidatorStatsByPoolId } from "./actions/pools"

export default function ValidatorStatsHooks() {
	const [poolId, setPoolId] = useState("")
	const [pool, setPool] = useState({})
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
