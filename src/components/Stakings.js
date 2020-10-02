import React, { useContext } from "react"
import { Box, Typography } from "@material-ui/core"
import AppContext from "../AppContext"
import Bonds from "./Bonds"
import Deposits from "./Deposits"
import SectionHeader from "./SectionHeader"

const Stakings = () => {
	const {
		stats,
		setToUnbond,
		onUnbond,
		setToRestake,
		onClaimRewards
	} = useContext(AppContext)

	return (
		<Box>
			<SectionHeader title={"Staked ADX"} />
			<Box mt={2}>
				<Box color="text.main">
					<Typography variant="h5" gutterBottom>
						{"BONDS"}
					</Typography>
				</Box>
				<Box mt={2} bgcolor="background.darkerPaper" boxShadow={25}>
					<Box p={3}>
						{Bonds({
							stats,
							onRequestUnbond: setToUnbond,
							onUnbond,
							onClaimRewards,
							onRestake: setToRestake
						})}
					</Box>
				</Box>
			</Box>
			<Box mt={2}>
				<Box color="text.main">
					<Typography variant="h5" gutterBottom>
						{"DEPOSITS"}
					</Typography>
				</Box>

				<Box mt={3} bgcolor="background.darkerPaper" boxShadow={25}>
					<Box p={3}>
						<Deposits />
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default Stakings
