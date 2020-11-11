import React, { useContext } from "react"
import AppContext from "../AppContext"
import { Box, SvgIcon, useMediaQuery } from "@material-ui/core"
import FarmCard from "./FarmCard"
import { formatADXPretty, getADXInUSDFormatted } from "../helpers/formatting"
import { ReactComponent as BalancerIcon } from "./../resources/balancer-bal-logo.svg"
import { ReactComponent as UniswapIcon } from "./../resources/uniswap-uni-logo.svg"
import { ReactComponent as YUSDIcon } from "./../resources/yUSD.svg"
import { ReactComponent as ADXIcon } from "./../resources/adex-logo-clean.svg"
import SectionHeader from "./SectionHeader"
import { useTranslation } from "react-i18next"

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
					<FarmCard
						id="validator-tom"
						platformIcon={
							<SvgIcon key={"balancer"} fontSize="large" color="inherit">
								<BalancerIcon width="99%" height="99%" />
							</SvgIcon>
						}
						assetsIcons={[
							<SvgIcon key={"adx"} fontSize="large" color="inherit">
								<ADXIcon width="99%" height="99%" />
							</SvgIcon>,
							<SvgIcon key={"bpt"} fontSize="large" color="inherit">
								<YUSDIcon width="99%" height="99%" />
							</SvgIcon>
						]}
						name={"Balancer ADX-yUSD"}
						platform={"Balancer"}
						depositAssets={"BPT-ADX-yUSD"}
						getDepositAssetsUrl={
							"https://pools.balancer.exchange/#/pool/0x415900c6e18b89531e3e24c902b05c031c71a925/"
						}
						depositAssetsLink={
							"https://pools.balancer.exchange/#/pool/0x415900c6e18b89531e3e24c902b05c031c71a925/"
						}
						rewardAssets={"ADX"}
						totalDepositTokenBalance={`${formatADXPretty(stats.totalStakeTom)}`}
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
				</Box>
			</Box>
		</Box>
	)
}

export default Farm
