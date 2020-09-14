import React, { useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Fab, Box, Typography } from "@material-ui/core"
import { AddSharp as AddIcon } from "@material-ui/icons"
import PoolCard from "./PoolCard"
import { getApproxAPY, formatADXPretty } from "../helpers/formatting"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	}
}))

const Pools = () => {
	const classes = useStyles()

	const { stats, setNewBondOpen, chosenWalletType } = useContext(AppContext)

	return (
		<Box>
			<Box>
				<Box>
					<Typography variant="h2">{"Pools"}</Typography>
				</Box>
				<Box>
					{!chosenWalletType.name && (
						<Fab
							disabled={!stats.loaded}
							onClick={() => setNewBondOpen(true)}
							variant="extended"
							color="secondary"
							style={{ position: "absolute", right: "5%", top: "50%" }}
						>
							<AddIcon className={classes.fabIcon} />
							{"Stake your ADX"}
						</Fab>
					)}
				</Box>
			</Box>
			<Box>
				<PoolCard
					icon={"tom"}
					name={"Tom"}
					totalStakedADX={formatADXPretty(stats.totalStake)}
					currentAPY={`${(getApproxAPY(null, stats.totalStake) * 100).toFixed(
						2
					)}% APY`}
				/>
			</Box>
		</Box>
	)
}

export default Pools
