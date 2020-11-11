import React, { useContext } from "react"
import AppContext from "../AppContext"
import { Box, SvgIcon, useMediaQuery } from "@material-ui/core"
import FarmCard from "./FarmCard"
import { formatADXPretty } from "../helpers/formatting"
import SectionHeader from "./SectionHeader"
import { useTranslation } from "react-i18next"
import { FARM_TOKENS } from "../helpers/constants"

const Farm = () => {
	const { t } = useTranslation()
	const { stats, chosenWalletType, prices } = useContext(AppContext)

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
					{FARM_TOKENS.map(farm => (
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
							totalDepositTokenBalance={`${formatADXPretty(
								stats.totalStakeTom
							)}`}
							totalDepositTokenStaked={`${formatADXPretty(
								stats.totalStakeTom.div(2)
							)}`}
							userStakedShare={"N/A"}
							currentAPY={`${50} %`}
							weeklyYield={`${(50 / (365 / 7)).toFixed(4)} %`}
							weeklyYieldInfo={[
								t("pools.currentDailyYield", {
									yield: (50 / 365).toFixed(4)
								})
							]}
							onDepositBtnClick={() => {}}
							onWithdrawBtnClick={() => {}}
							loading={false && !stats.loaded}
							disabled={!canStake}
							disabledInfo={t("pools.connectWalletToStake")}
							liquidityInfoText={t("farm.liquidityInfo")}
							liquidityStaked={"1000.69 BPT-ADX-yUSD = 700 ADX + 60 yUSD "}
							liquidityOnWallet={"420.69 BPT-ADX-yUSD = 300 ADX + 25 yUSD"}
						/>
					))}
				</Box>
			</Box>
		</Box>
	)
}

export default Farm
