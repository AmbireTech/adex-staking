import React, { useContext } from "react"
import { FarmContext } from "../FarmProvider"
import { Box, SvgIcon, useMediaQuery } from "@material-ui/core"
import FarmCard from "./FarmCard"
import { formatADXPretty } from "../helpers/formatting"
import SectionHeader from "./SectionHeader"
import { useTranslation } from "react-i18next"
import { FARM_POOLS } from "../helpers/constants"

const Farm = () => {
	const { t } = useTranslation()
	const { farmStats } = useContext(FarmContext)
	const { pollStatsLoaded, userStatsLoaded, statsByPoolId } = farmStats

	console.log("farmStats", farmStats)

	const canStake = true // !!chosenWalletType.name && !!stats.connectedWalletAddress

	const justifyCenter = useMediaQuery(theme => theme.breakpoints.down("xs"))

	return (
		<Box>
			<SectionHeader title={t("common.farm")} />
			<Box mt={4}>
				<Box
					display="flex"
					flex={1}
					flexDirection="row"
					flexWrap="wrap"
					alignItems="stretch"
					justifyContent={justifyCenter ? "center" : "flex-start"}
				>
					{FARM_POOLS.map(farm => {
						const stats = statsByPoolId ? statsByPoolId[farm.poolId] : null

						return (
							<FarmCard
								key={farm.token}
								id={farm.token}
								platformIcon={
									<SvgIcon fontSize="large" color="inherit">
										<farm.platformIcon width="99%" height="99%" />
									</SvgIcon>
								}
								assetsIcons={[
									farm.assetsIcons.map((Icon, i) => (
										<SvgIcon key={i} fontSize="large" color="inherit">
											<Icon width="99%" height="99%" />
										</SvgIcon>
									))
								]}
								name={farm.name}
								platform={farm.platform}
								depositAssets={farm.depositAssetsName}
								getDepositAssetsUrl={farm.getDepositAssetsUrl}
								rewardAssets={farm.rewardAssetsName}
								totalDepositTokenBalance={
									stats ? `${formatADXPretty(stats.totalSupply)}` : t("farm.NA")
								}
								totalDepositTokenStaked={
									stats ? `${formatADXPretty(stats.totalStaked)}` : t("farm.NA")
								}
								userStakedShare={
									userStatsLoaded ? `${stats.useShare * 100} %` : t("farm.NA")
								}
								currentAPY={`${50} %`}
								weeklyYield={`${(50 / (365 / 7)).toFixed(4)} %`}
								weeklyYieldInfo={[
									t("pools.currentDailyYield", {
										yield: (50 / 365).toFixed(4)
									})
								]}
								onDepositBtnClick={() => {}}
								onWithdrawBtnClick={() => {}}
								loading={!pollStatsLoaded}
								disabled={!canStake}
								disabledInfo={t("pools.connectWalletToStake")}
								liquidityInfoText={t("farm.liquidityInfo")}
								liquidityStaked={
									userStatsLoaded
										? `${formatADXPretty(stats.userLPBalance)} ${farm.token}`
										: t("farm.NA")
								}
								liquidityOnWallet={
									userStatsLoaded
										? `${formatADXPretty(stats.walletBalance)} ${farm.token}`
										: t("farm.NA")
								}
							/>
						)
					})}
				</Box>
			</Box>
		</Box>
	)
}

export default Farm
