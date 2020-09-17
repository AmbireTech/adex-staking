import React, { useContext } from "react"
import AppContext from "../AppContext"
import { Box, SvgIcon, useMediaQuery } from "@material-ui/core"
import { Loyalty as LoyaltyIcon } from "@material-ui/icons"
import PoolCard from "./PoolCard"
import {
	getApproxAPY,
	formatADXPretty,
	getADXInUSDFormatted
} from "../helpers/formatting"
import { ReactComponent as TomIcon } from "./../resources/tom-ic.svg"
import SectionHeader from "./SectionHeader"

const Pools = () => {
	const { stats, setNewBondOpen, chosenWalletType, prices } = useContext(
		AppContext
	)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress
	const tomAPY = getApproxAPY(null, stats.totalStakeTom) * 100
	const justifyCenter = useMediaQuery(theme => theme.breakpoints.down("xs"))

	return (
		<Box>
			<SectionHeader title={"Pools"} />
			<Box mt={4}>
				<Box
					display="flex"
					flex
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
						currentAPY={`${tomAPY.toFixed(2)}% APY`}
						dailyYield={`${(tomAPY / 365).toFixed(4)}% DPY`}
						dailyYieldInfo={`Current daily yield ${(tomAPY / 365).toFixed(4)}%`}
						onStakeBtnClick={() => setNewBondOpen(true)}
						loading={!stats.loaded}
						disabled={!canStake}
						disabledInfo={"Connect wallet to stake"}
					/>

					<PoolCard
						poolId="loyalty-pool"
						icon={<LoyaltyIcon fontSize="large" />}
						name={"Loyalty pool "}
						totalStakedADX={formatADXPretty(stats.totalStakeTom)}
						currentAPY={`${(
							getApproxAPY(null, stats.totalStakeTom) * 100
						).toFixed(2)}% APY`}
						onStakeBtnClick={() => setNewBondOpen(true)}
						loading={!stats.loaded}
						disabled={!canStake}
						comingSoon
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default Pools
