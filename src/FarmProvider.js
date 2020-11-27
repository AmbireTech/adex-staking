import React, { useEffect, useState, useContext, useCallback } from "react"
import { getFarmPoolsStats } from "./actions/farm"
import AppContext from "./AppContext"
import { useTranslation } from "react-i18next"

export const FarmContext = React.createContext()

const REFRESH_INTERVAL_NO_WALLET = 300_000 // 300 sec
const REFRESH_INTERVAL_WALLET = 60_000 // 60 sec

function useFarm() {
	const { t } = useTranslation()
	const { chosenWalletType, prices, addSnack, userIdle } = useContext(
		AppContext
	)
	const [pricesLoaded, setPricesLoaded] = useState(false)
	const [farmStats, setStats] = useState({})
	const [getStats, setGetFarmStats] = useState(false)

	const refreshFarmStats = useCallback(async () => {
		const doUpdate = getStats && !userIdle && pricesLoaded

		if (doUpdate) {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getStats, userIdle, chosenWalletType.name, pricesLoaded, t])

	useEffect(() => {
		refreshFarmStats()
		const intvl = setInterval(
			refreshFarmStats,
			chosenWalletType.name
				? REFRESH_INTERVAL_WALLET
				: REFRESH_INTERVAL_NO_WALLET
		)

		return () => {
			if (intvl) {
				clearInterval(intvl)
			}
		}
	}, [chosenWalletType.name, refreshFarmStats])

	useEffect(() => {
		if (!!prices && Object.keys(prices).length) {
			setPricesLoaded(true)
		}
	}, [prices, setPricesLoaded])

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
