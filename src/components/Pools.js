import React, { useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Fab, Box, Typography, SvgIcon } from "@material-ui/core"
import { AddSharp as AddIcon } from "@material-ui/icons"
import PoolCard from "./PoolCard"
import { getApproxAPY, formatADXPretty } from "../helpers/formatting"
import { ReactComponent as TomIcon } from "./../resources/tom-ic.svg"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	}
}))

const Pools = () => {
	const classes = useStyles()

	const { stats, setNewBondOpen, chosenWalletType } = useContext(AppContext)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

	return (
		<Box>
			<Box display="flex" flexDirection="row" justifyContent="space-between">
				<Box>
					<Typography variant="h2">{"Pools"}</Typography>
				</Box>
				<Box>
					{chosenWalletType.name && (
						<Fab
							disabled={!stats.loaded}
							onClick={() => setNewBondOpen(true)}
							variant="extended"
							color="secondary"
						>
							<AddIcon className={classes.fabIcon} />
							{"Stake your ADX"}
						</Fab>
					)}
				</Box>
			</Box>
			<Box mt={4}>
				<PoolCard
					icon={
						<SvgIcon fontSize="large" color="inherit">
							<TomIcon width="100%" height="100%" color="secondary" />
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
			</Box>
		</Box>
	)
}

export default Pools
