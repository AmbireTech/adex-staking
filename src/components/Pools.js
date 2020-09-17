import React, { useContext } from "react"
import AppContext from "../AppContext"
import { Box, SvgIcon } from "@material-ui/core"
import PoolCard from "./PoolCard"
import { getApproxAPY, formatADXPretty } from "../helpers/formatting"
import { ReactComponent as TomIcon } from "./../resources/tom-ic.svg"
import { ReactComponent as ChainlinkIcon } from "./../resources/chainlink-logo-white.svg"
import SectionHeader from "./SectionHeader"

const Pools = () => {
	const { stats, setNewBondOpen, chosenWalletType } = useContext(AppContext)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

	return (
		<Box>
			<SectionHeader title={"Pools"} />
			<Box mt={4}>
				<PoolCard
					icon={
						<SvgIcon fontSize="large" color="inherit">
							<TomIcon width="100%" height="100%" />
						</SvgIcon>
					}
					name={"Tom"}
					totalStakedADX={formatADXPretty(stats.totalStakeTom)}
					currentAPY={`${(
						getApproxAPY(null, stats.totalStakeTom) * 100
					).toFixed(2)}% APY`}
					onStakeBtnClick={() => setNewBondOpen(true)}
					loading={!stats.loaded}
					disabled={!canStake}
				/>

				<PoolCard
					icon={
						<SvgIcon fontSize="large" color="inherit">
							<ChainlinkIcon width="100%" height="100%" />
						</SvgIcon>
					}
					name={"Chainlink"}
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
	)
}

export default Pools
