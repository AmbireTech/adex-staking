import React, { useContext } from "react"
import { Box, Typography } from "@material-ui/core"
import AppContext from "../AppContext"
import Bonds from "./Bonds"
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
				<Typography variant="body2" gutterBottom>
					{`This table will show all your individual ADX deposits in validator pools (bonds), along with 
                    information as status, amount and current APY. By using the action buttons, you will be 
                    able to request unbonding and withdraw your ADX after the 30 day lock-up period.`}
				</Typography>
				<Box mt={2} bgcolor="background.darkerPaper">
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
		</Box>
	)
}

export default Stakings
