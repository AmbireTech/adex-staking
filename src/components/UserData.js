import React from "react"
import { Box } from "@material-ui/core"
import StatsCard from "./StatsCard"
import { formatADXPretty, getADXInUSDFormatted } from "../helpers/formatting"
import { useTranslation } from "react-i18next"
import { BigNumber } from "ethers"

export default function UserData({ stats, prices }) {
	const { t } = useTranslation()

	return (
		<Box width={1}>
			<Box mb={1.5}>
				{StatsCard({
					size: "large",
					loaded: stats.loaded,
					title: t("userData.myAdxBalance"),
					subtitle: stats.totalBalanceADX
						? formatADXPretty(stats.totalBalanceADX) + " ADX"
						: "",

					extra: getADXInUSDFormatted(prices, stats.totalBalanceADX),
					/*actions: (<Button
							size="small"
							variant="contained"
							color="secondary"
							disabled={true}
						>upgrade</Button>)*/
					extraInfo: t("userData.adxPrice", {
						priceUSD: getADXInUSDFormatted(
							prices,
							BigNumber.from((1e18).toString())
						)
					})
				})}
			</Box>

			<Box mb={1.5}>
				{StatsCard({
					loaded: stats.loaded,
					title: t("userData.onWallet"),
					titleInfo: t("userData.onWalletInfo"),
					subtitle: stats.userBalance
						? formatADXPretty(stats.userBalance) + " ADX"
						: "",
					extra: getADXInUSDFormatted(prices, stats.userBalance)
				})}
			</Box>

			{/* <Box mb={1.5}>
				{StatsCard({
					loaded: stats.loaded,
					title: t("userData.activeStake"),
					titleInfo: t("userData.activeStakeInfo", {
						apy: (tomPoolStats.totalAPY * 100).toFixed(2)
					}),
					subtitle: formatADXPretty(stats.userTotalStake) + " ADX",
					extra: getADXInUSDFormatted(prices, stats.userTotalStake)
				})}
			</Box> */}

			<Box mb={1.5}>
				{StatsCard({
					loaded: stats.loaded,
					title: t("userData.totalStaked"),
					titleInfo: [
						t("userData.activeDepositsInfoLocked", {
							amount: formatADXPretty(stats.totalLockedOnDeposits),
							currency: "ADX"
						}),
						t("userData.activeUsersStakeLegacy", {
							amount: formatADXPretty(stats.userTotalStake),
							currency: "ADX"
						}),
						t("userData.activeDepositsInfoPendingToUnlock", {
							amount: formatADXPretty(stats.totalPendingToUnlock),
							currency: "ADX"
						}),
						t("userData.activeDepositsInfoUnlocked", {
							amount: formatADXPretty(stats.totalUnlockedDeposits),
							currency: "ADX"
						}),
						t("userData.activeDepositsInfoUnclaimed", {
							amount: formatADXPretty(stats.tomRewardADX),
							currency: "ADX"
						})
					],
					subtitle: formatADXPretty(stats.totalStaked) + " ADX",
					extra: getADXInUSDFormatted(prices, stats.totalStaked)
				})}
			</Box>
		</Box>
	)
}
