import React, { useEffect, useState, useContext, useCallback } from "react"
import { getFarmPoolsStats } from "./actions/farm"
import AppContext from "./AppContext"
import { useTranslation } from "react-i18next"

export const FarmContext = React.createContext()

const REFRESH_INTERVAL = 60_000 // 60 sec

function useFarm() {
	const { t } = useTranslation()
	const { chosenWalletType, prices, addSnack } = useContext(AppContext)
	const [farmStats, setStats] = useState({})
	const [getStats, setGetFarmStats] = useState(false)

	const refreshFarmStats = useCallback(async () => {
		if (getStats && !!Object.keys(prices).length) {
			try {
				const stats = await getFarmPoolsStats({
					chosenWalletType,
					externalPrices: prices
				})
				setStats(stats)
			} catch (e) {
				console.error("err loading farm stats", e)
				if (e.code === 4001) {
					addSnack(t("errors.authDeniedByUser"), "error", 20_000)
				} else {
					addSnack(
						t("errors.loadingStats", {
							error: !!e ? e.message || e.toString() : ""
						}),
						"error",
						20_000
					)
				}
			}
		}
	}, [getStats, addSnack, chosenWalletType, prices, t])

	useEffect(() => {
		let intvl = null
		if (getStats) {
			intvl = setInterval(refreshFarmStats, REFRESH_INTERVAL)
		}

		return () => {
			if (intvl) {
				clearInterval(intvl)
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshFarmStats])

	useEffect(() => {
		if (getStats) {
			refreshFarmStats()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getStats, chosenWalletType])

	return {
		farmStats,
		setGetFarmStats
	}
}

export const FarmProvider = ({ children }) => {
	const farmHooks = useFarm()
	return (
		<FarmContext.Provider value={farmHooks}>{children}</FarmContext.Provider>
	)
}
