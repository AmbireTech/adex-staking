import React, { useContext } from "react"
import AppContext from "../AppContext"
import { Box, SvgIcon, useMediaQuery } from "@material-ui/core"
import PoolCard from "./PoolCard"
import { formatADXPretty, getADXInUSDFormatted } from "../helpers/formatting"
import { ReactComponent as TomIcon } from "./../resources/tom-ic.svg"
import { ReactComponent as LoyaltyIcon } from "./../resources/loyalty-ic.svg"
import SectionHeader from "./SectionHeader"
import { UNBOND_DAYS, POOLS, DEPOSIT_POOLS } from "../helpers/constants"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import EmailSignUp from "./EmailSignUpCard"
import { useTranslation } from "react-i18next"
import { DEPOSIT_ACTION_TYPES } from "../actions"

const DepositsDialog = WithDialog(DepositForm)
const TOM_LEGACY_POOL = POOLS[0]
const TOM_V5_POOL = DEPOSIT_POOLS[1]
const LOYALTY_POOL = DEPOSIT_POOLS[0]

const Pools = () => {
	const { t } = useTranslation()
	const {
		stats,
		setNewBondOpen,
		chosenWalletType,
		prices,
		setNewBondPool
	} = useContext(AppContext)
	const { loyaltyPoolStats, tomPoolStats, tomStakingV5PoolStats } = stats

	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress
	const tomAPY = tomPoolStats.totalAPY * 100
	const tomV5APY = tomStakingV5PoolStats.currentAPY * 100
	const justifyCenter = useMediaQuery(theme => theme.breakpoints.down("xs"))

	const loyaltyPoolAPY = loyaltyPoolStats.currentAPY * 100

	return (
		<Box>
			<SectionHeader title={t("common.pools")} />
			<Box mt={4}>
				<Box
					display="flex"
					flex={1}
					flexDirection="row"
					flexWrap="wrap"
					alignItems="stretch"
					justifyContent={justifyCenter ? "center" : "flex-start"}
				>
					<PoolCard
						id="validator-tom-v5"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<TomIcon width="100%" height="100%" />
							</SvgIcon>
						}
						name={t("common.tomV5")}
						totalStakedADX={`${formatADXPretty(
							tomStakingV5PoolStats.currentTotalActiveStake
						)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							tomStakingV5PoolStats.currentTotalActiveStake
						)}`}
						currentAPY={`${tomV5APY.toFixed(2)} %`}
						weeklyYield={`${(tomV5APY / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							t("pools.currentDailyYield", {
								yield: (tomV5APY / 365).toFixed(4)
							})
						]}
						onStakeBtnClick={() => {
							setNewBondPool(TOM_V5_POOL.id)
							setNewBondOpen(true)
						}}
						loading={!tomStakingV5PoolStats.loaded}
						disabled={!canStake}
						disabledInfo={t("pools.connectWalletToStake")}
						lockupPeriodTitle={t("common.unbondPeriod")}
						lockupPeriodInfo={t("pools.lockupPeriodInfo", {
							count: TOM_V5_POOL.lockupPeriod
						})}
						lockupPeriod={t("pools.unbondPeriodDay", {
							count: TOM_V5_POOL.lockupPeriod
						})}
						statsPath={`/stats?validator=${t(TOM_V5_POOL.label)}`}
					/>

					<PoolCard
						id="loyalty-pool"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<LoyaltyIcon width="100%" height="100%" />
							</SvgIcon>
						}
						name={t("common.loPo")}
						totalStakedADX={`${formatADXPretty(
							loyaltyPoolStats.poolTotalStaked
						)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							loyaltyPoolStats.poolTotalStaked
						)}`}
						currentAPY={`${loyaltyPoolAPY.toFixed(2)} %`}
						weeklyYield={`${(loyaltyPoolAPY / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							t("pools.currentDailyYield", {
								yield: (loyaltyPoolAPY / 365).toFixed(4)
							})
						]}
						onStakeBtnClick={() => {
							setNewBondOpen(true)
						}}
						loading={!loyaltyPoolStats.loaded}
						disabled={!canStake}
						disabledInfo={t("pools.connectWalletToDeposit")}
						lockupPeriodTitle={t("common.unbondPeriod")}
						lockupPeriodInfo={t("common.noUnbondPeriod")}
						lockupPeriod={t("common.noUnbondPeriod")}
						extraData={[
							{
								id: "loyalty-pool-deposits-limit",
								title: t("pools.totalDepositsLimit"),
								titleInfo: "",
								normalValue: "30 000 000 ADX",
								importantValue: "",
								valueInfo: "",
								extra: "",
								extrInfo: ""
							}
						]}
						actionBtn={
							<DepositsDialog
								fullWidth
								id="loyalty-pool-deposit-form-card"
								title={t("common.addNewDeposit")}
								btnLabel={t("common.deposit")}
								color="secondary"
								size="large"
								variant="contained"
								disabled={!canStake}
								depositPool={LOYALTY_POOL.id}
								actionType={DEPOSIT_ACTION_TYPES.deposit}
							/>
						}
						// comingSoon
					/>

					<PoolCard
						id="validator-tom"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<TomIcon width="100%" height="100%" />
							</SvgIcon>
						}
						name={t("common.tom")}
						totalStakedADX={`${formatADXPretty(
							tomPoolStats.totalCurrentTotalActiveStake
						)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							tomPoolStats.totalCurrentTotalActiveStake
						)}`}
						currentAPY={`${tomAPY.toFixed(2)} %`}
						weeklyYield={`${(tomAPY / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							t("pools.currentDailyYield", {
								yield: (tomAPY / 365).toFixed(4)
							})
						]}
						onStakeBtnClick={() => {
							setNewBondPool(TOM_LEGACY_POOL.id)
							setNewBondOpen(true)
						}}
						loading={!tomPoolStats.loaded}
						disabled={!canStake}
						disabledInfo={t("pools.connectWalletToStake")}
						lockupPeriodTitle={t("common.unbondPeriod")}
						lockupPeriodInfo={t("pools.lockupPeriodInfo", {
							count: UNBOND_DAYS
						})}
						lockupPeriod={t("pools.unbondPeriodDay", { count: UNBOND_DAYS })}
						statsPath={`/stats?validator=${t(TOM_LEGACY_POOL.label)}`}
					/>
					{/* <PoolCard
						id="liquidity-pool"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<LiquidityIcon />
							</SvgIcon>
						}
						name={t("common.liPo")}
						loading={!stats.loaded}
						comingSoon
					/> */}
					<EmailSignUp formId={2} formName="stakingportalleads" />
				</Box>
			</Box>
		</Box>
	)
}

export default Pools
