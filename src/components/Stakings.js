import React, { useContext } from "react"
import { Box } from "@material-ui/core"
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
				{Bonds({
					stats,
					onRequestUnbond: setToUnbond,
					onUnbond,
					onClaimRewards,
					onRestake: setToRestake
				})}
			</Box>
		</Box>
	)
}

export default Stakings
