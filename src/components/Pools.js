import React, { useContext } from "react"
import AppContext from "../AppContext"
import {
	Box,
	Grid,
	SvgIcon,
	Typography,
	useMediaQuery
} from "@material-ui/core"
import PoolCard from "./PoolCard"
import { formatADXPretty, getADXInUSDFormatted } from "../helpers/formatting"
import { ReactComponent as TomIcon } from "./../resources/tom-ic.svg"
// import { ReactComponent as JerryIcon } from "./../resources/jerry-ic.svg"
import { ReactComponent as LoyaltyIcon } from "./../resources/loyalty-ic.svg"
import { ReactComponent as StarsIcon } from "./../resources/stars-ic.svg"
// import { ReactComponent as StarsIcon } from "./../resources/stars-ic.svg"
import SectionHeader from "./SectionHeader"
import { DEPOSIT_POOLS } from "../helpers/constants"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import EmailSignUp from "./EmailSignUpCard"
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import Anchor from "components/Anchor"
import { useTranslation } from "react-i18next"
import { DEPOSIT_ACTION_TYPES } from "../actions"
import { makeStyles } from "@material-ui/core/styles"

const DepositsDialog = WithDialog(DepositForm)
const TOM_V5_POOL = DEPOSIT_POOLS[1]
const LOYALTY_POOL = DEPOSIT_POOLS[0]

const useStyles = makeStyles(theme => {
	return {
		textWhite: {
			color: "white"
		},
		learnMore: {
			color: theme.palette.contrast,
			fontWeight: "bold",
			textTransform: "capitalize"
		},
		learnMoreArrow: {
			fontSize: 12,
			marginLeft: theme.spacing(1)
		}
	}
})

const Pools = () => {
	const classes = useStyles()
	const { t } = useTranslation()
	const { stats, chosenWalletType, prices } = useContext(AppContext)
	const { loyaltyPoolStats, tomStakingV5PoolStats } = stats

	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress
	const tomV5APY = tomStakingV5PoolStats.currentAPY * 100
	const justifyCenter = useMediaQuery(theme => theme.breakpoints.down("xs"))

	const loyaltyPoolAPY = loyaltyPoolStats.currentAPY * 100

	return (
		<Box p={3}>
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
							tomStakingV5PoolStats.poolTotalStaked
						)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							tomStakingV5PoolStats.poolTotalStaked
						)}`}
						currentAPY={`${tomV5APY.toFixed(2)} %`}
						weeklyYield={`${(tomV5APY / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							t("pools.currentDailyYield", {
								yield: (tomV5APY / 365).toFixed(4)
							})
						]}
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
						// statsPath={`/stats?validator=${t(TOM_V5_POOL.label)}`}
						actionBtn={
							<DepositsDialog
								id="staking-pool-tom-deposit-form-card"
								title={t("deposits.depositTo", {
									pool: t("common.tomStakingPool")
								})}
								btnType="secondary"
								btnLabel={t("common.deposit")}
								color="secondary"
								size="large"
								variant="contained"
								fullWidth
								disabled={!canStake}
								depositPool={DEPOSIT_POOLS[1].id}
								actionType={DEPOSIT_ACTION_TYPES.deposit}
							/>
						}
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
						loading={!loyaltyPoolStats.loaded}
						disabled
						disabledInfo={
							!canStake
								? t("pools.connectWalletToDeposit")
								: t("pools.loyaltyPoolDisabledInfo")
						}
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
								btnType="secondary"
								id="loyalty-pool-deposit-form-card"
								title={t("common.addNewDeposit")}
								btnLabel={t("common.deposit")}
								color="secondary"
								disabled
								size="large"
								variant="contained"
								depositPool={LOYALTY_POOL.id}
								actionType={DEPOSIT_ACTION_TYPES.deposit}
							/>
						}
					/>
					<Box>
						<Box
							bgcolor={"background.card"}
							p={2}
							my={3}
							mx={1.5}
							width={270}
							display="flex"
							flexDirection="column"
							alignItems="center"
							boxShadow={25}
							position="relative"
						>
							<Grid
								container
								direction="row"
								justifyContent="center"
								alignItems="center"
								spacing={2}
							>
								<Grid item xs={2}>
									<StarsIcon />
								</Grid>
								<Grid item xs={10}>
									<Typography align="left" variant="h5" color="textPrimary">
										<strong>{t("email.newToStaking")}</strong>
									</Typography>

									<Box display="flex" alignItems="center">
										<Typography
											className={classes.learnMore}
											align="left"
											variant="body1"
											color="secondary"
										>
											<Anchor
												target="_blank"
												href="https://help.adex.network/hc/en-us/articles/9638410468508-How-to-stake-your-ADX-tokens-"
											>
												{t("email.learnMore")}{" "}
												<ArrowForwardIosIcon
													fontSize="small"
													classes={{
														fontSizeSmall: classes.learnMoreArrow
													}}
												/>
											</Anchor>
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</Box>
						<EmailSignUp formId={2} formName="stakingportalleads" />
					</Box>
				</Box>
			</Box>

			{/* 
			<Box mt={4}>
			<SectionHeader title={t("common.legacyPools")} />
			<PoolCard
						id="validator-tom-v5"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<JerryIcon width="100%" height="100%" />
							</SvgIcon>
						}
						name={t("common.jerryV5")}
						totalStakedADX={`${formatADXPretty(
							tomStakingV5PoolStats.poolTotalStaked
						)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							tomStakingV5PoolStats.poolTotalStaked
						)}`}
						currentAPY={`${tomV5APY.toFixed(2)} %`}
						weeklyYield={`${(tomV5APY / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							t("pools.currentDailyYield", {
								yield: (tomV5APY / 365).toFixed(4)
							})
						]}
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
						actionBtn={
							<DepositsDialog
								id="staking-pool-tom-deposit-form-card"
								title={t("deposits.depositTo", {
									pool: t("common.tomStakingPool")
								})}
								btnLabel={t("common.deposit")}
								color="secondary"
								size="large"
								variant="contained"
								fullWidth
								disabled={!canStake}
								depositPool={DEPOSIT_POOLS[1].id}
								actionType={DEPOSIT_ACTION_TYPES.deposit}
							/>
						}
					/> 
			</Box>
			*/}
		</Box>
	)
}

export default Pools
