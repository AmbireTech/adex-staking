import React, { useContext } from "react"
import AppContext from "../AppContext"
import { Box, SvgIcon, useMediaQuery } from "@material-ui/core"
import { AccountBalanceSharp as LiquidityIcon } from "@material-ui/icons"
import PoolCard from "./PoolCard"
import {
	getApproxAPY,
	formatADXPretty,
	getADXInUSDFormatted
} from "../helpers/formatting"
import { ReactComponent as TomIcon } from "./../resources/tom-ic.svg"
import { ReactComponent as LoyaltyIcon } from "./../resources/loyalty-ic.svg"
import SectionHeader from "./SectionHeader"
import { UNBOND_DAYS, POOLS, DEPOSIT_POOLS } from "../helpers/constants"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import EmailSignUp from "./EmailSignUpCard"

const DepositsDialog = WithDialog(DepositForm)

const Pools = () => {
	const {
		stats,
		setNewBondOpen,
		chosenWalletType,
		prices,
		setNewBondPool
	} = useContext(AppContext)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress
	const tomAPY = getApproxAPY(null, stats.totalStakeTom) * 100
	const justifyCenter = useMediaQuery(theme => theme.breakpoints.down("xs"))
	const { loyaltyPoolStats } = stats
	const loyaltyPoolAPY = loyaltyPoolStats.currentAPY

	return (
		<Box>
			<SectionHeader title={"Pools"} />
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
						poolId="validator-tom"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<TomIcon width="100%" height="100%" />
							</SvgIcon>
						}
						name={"Tom"}
						totalStakedADX={`${formatADXPretty(stats.totalStakeTom)} ADX`}
						totalStakedUSD={`${getADXInUSDFormatted(
							prices,
							stats.totalStakeTom
						)}`}
						currentAPY={`${tomAPY.toFixed(2)} %`}
						weeklyYield={`${(tomAPY / (365 / 7)).toFixed(4)} %`}
						weeklyYieldInfo={[
							`Current daily yield ${(tomAPY / 365).toFixed(4)} %`
						]}
						onStakeBtnClick={() => {
							setNewBondPool(POOLS[0].id)
							setNewBondOpen(true)
						}}
						loading={!stats.loaded}
						disabled={!canStake}
						disabledInfo={"Connect wallet to stake"}
						lockupPeriodTitle={"Unbond period"}
						lockupPeriodInfo={`The unbond period is the amount 
							you must wait before withdrawing your ADX tokens. 
							From the moment you request unbonding, the ${UNBOND_DAYS} days start counting. 
							During those days, you won't receive staking rewards.`}
						lockupPeriod={`${UNBOND_DAYS} days`}
					/>

					<PoolCard
						poolId="loyalty-pool"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<LoyaltyIcon width="100%" height="100%" />
							</SvgIcon>
						}
						name={"Loyalty pool"}
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
							`Current daily yield ${(loyaltyPoolAPY / 365).toFixed(4)} %`
						]}
						onStakeBtnClick={() => {
							setNewBondOpen(true)
						}}
						loading={!loyaltyPoolStats.loaded}
						disabled={!canStake}
						disabledInfo={"Connect wallet to deposit"}
						lockupPeriodTitle={"Unbond period"}
						lockupPeriodInfo={`No unbond period`}
						lockupPeriod={`No unbond period`}
						extraData={[
							{
								id: "loyalty-pool-deposits-limit",
								title: "Total deposits limit",
								titleInfo: "",
								normalValue: "25 000 000 ADX",
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
								title="Add new deposit"
								btnLabel="Deposit"
								color="secondary"
								size="large"
								variant="contained"
								disabled={!canStake}
								depositPool={DEPOSIT_POOLS[0].id}
							/>
						}
						// comingSoon
					/>
					<PoolCard
						poolId="liquidity-pool"
						icon={
							<SvgIcon fontSize="large" color="inherit">
								<LiquidityIcon />
							</SvgIcon>
						}
						name={"Liquidity pool"}
						loading={!stats.loaded}
						comingSoon
					/>
					<EmailSignUp formId={2} formName="stakingportalleads" />
				</Box>
			</Box>
		</Box>
	)
}

export default Pools
