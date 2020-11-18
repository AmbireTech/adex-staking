import React, { useEffect, useState, useContext, useCallback } from "react"
import { getFarmPoolsStats } from "./actions/farm"
import AppContext from "./AppContext"
import { useTranslation } from "react-i18next"

export const FarmContext = React.createContext()

const REFRESH_INTERVAL = 69_000 // 69 sec

function useFarm() {
	const { t } = useTranslation()
	const { chosenWalletType, prices, addSnack } = useContext(AppContext)
	const [farmStats, setStats] = useState({})

	const refreshFarmStats = useCallback(async () => {
		if (Object.keys(prices).length) {
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
	}, [addSnack, chosenWalletType, prices, t])

	useEffect(() => {
		const intvl = setInterval(refreshFarmStats, REFRESH_INTERVAL)
		return () => clearInterval(intvl)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshFarmStats])

	useEffect(() => {
		// TODO: update on wallet change but not on prices change
		if (Object.keys(prices).length) {
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
