import React, { useEffect, useState, useContext } from "react"
import { getFarmPoolsStats } from "./actions/farm"
import AppContext from "./AppContext"

export const FarmContext = React.createContext()

function useFarm() {
	const { chosenWalletType, prices } = useContext(AppContext)
	const [farmStats, setStats] = useState({})

	useEffect(() => {
		if (Object.keys(prices).length && !Object.keys(farmStats).length) {
			const updatePoolStats = async () => {
				const stats = await getFarmPoolsStats({
					chosenWalletType,
					externalPrices: prices
				})
				setStats(stats)
			}
			updatePoolStats()
		}
		// Will not update on prices change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType, prices])

	return {
		farmStats
	}
}

export const FarmProvider = ({ children }) => {
	const farmHooks = useFarm()
	return (
		<FarmContext.Provider value={farmHooks}>{children}</FarmContext.Provider>
	)
}
