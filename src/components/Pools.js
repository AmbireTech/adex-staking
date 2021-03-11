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
import { ReactComponent as LoyaltyIcon } from "./../resources/loyalty-ic.svg"
import SectionHeader from "./SectionHeader"
import { UNBOND_DAYS, POOLS, DEPOSIT_POOLS } from "../helpers/constants"
import StarsIcon from "@material-ui/icons/Stars"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import EmailSignUp from "./EmailSignUpCard"
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import Anchor from "components/Anchor"
import { useTranslation } from "react-i18next"
import { makeStyles } from "@material-ui/core/styles"

const DepositsDialog = WithDialog(DepositForm)

const useStyles = makeStyles(theme => {
	return {
		fontSizeSmall: {
			fontSize: 12
		},
		textWhite: {
			color: "white"
		}
	}
})

const Pools = () => {
	const classes = useStyles()
	const { t } = useTranslation()
	const {
		stats,
		setNewBondOpen,
		chosenWalletType,
		prices,
		setNewBondPool
	} = useContext(AppContext)
	const { loyaltyPoolStats, tomPoolStats } = stats

	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress
	const tomAPY = tomPoolStats.totalAPY * 100
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
							setNewBondPool(POOLS[0].id)
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
						statsPath={`/stats?validator=${t(POOLS[0].label)}`}
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
								depositPool={DEPOSIT_POOLS[0].id}
							/>
						}
						// comingSoon
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
								justify="center"
								alignItems="center"
								spacing={2}
							>
								<Grid container xs={2} justify="center" alignItems="center">
									<StarsIcon color="secondary" />
								</Grid>
								<Grid item xs={10}>
									<Typography
										align="left"
										variant="h5"
										classes={{ root: classes.textWhite }}
									>
										<strong>New to staking?</strong>
									</Typography>
									<Typography align="left" variant="p" color="secondary">
										<Box display="flex" alignItems="center">
											<Anchor
												target="_blank"
												href="https://help.adex.network/hc/en-us/articles/360019465979-New-to-staking-A-summary-of-all-you-need-to-know"
											>
												Learn more{" "}
												<Box pl={"3px"} display="flex">
													<ArrowForwardIosIcon
														fontSize="small"
														classes={{
															fontSizeSmall: classes.fontSizeSmall
														}}
													/>
												</Box>
											</Anchor>
										</Box>
									</Typography>
								</Grid>
							</Grid>
						</Box>
						<EmailSignUp formId={2} formName="stakingportalleads" />
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default Pools
