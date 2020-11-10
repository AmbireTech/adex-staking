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

	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

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
						icons={[
							<SvgIcon key={"icon-1"} fontSize="large" color="inherit">
								<BalancerIcon width="99%" height="99%" />
							</SvgIcon>,
							<SvgIcon key={"icon-2"} fontSize="large" color="inherit">
								<ADXIcon width="99%" height="99%" />
							</SvgIcon>,
							<SvgIcon key={"icon-3"} fontSize="large" color="inherit">
								<YUSDIcon width="99%" height="99%" />
							</SvgIcon>
						]}
						name={"BPT-ADX-yUSD"}
						totalStakedADX={`${formatADXPretty(stats.totalStakeTom)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							stats.totalStakeTom
						)}`}
						currentAPY={`${50} %`}
						weeklyYield={`${(50 / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							t("pools.currentDailyYield", {
								yield: (50 / 365).toFixed(4)
							})
						]}
						onDepositBtnClick={() => {}}
						onWithdrawBtnClick={() => {}}
						loading={!stats.loaded}
						disabled={!canStake}
						disabledInfo={t("pools.connectWalletToStake")}
						liquidityInfoText={t("farm.liquidityInfo")}
						liquidityStaked={t("farm.staked", {
							staked: "0.5 BPT = 20 ETH + 52100 ADX"
						})}
						liquidityOnWallet={t("farm.onWallet", {
							onWallet: "1 BPT = 40 ETH + 104200 ADX"
						})}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default Farm
