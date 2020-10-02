import React, { useContext, useEffect, useState } from "react"
import {
	TableRow,
	TableCell,
	Button,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { formatADXPretty } from "../helpers/formatting"
import AppContext from "../AppContext"

const getLoyaltyPoolDeposit = loyaltyPoolStats => ({
	poolId: "adex-loyalty-pool",
	label: "Loyalty Pool",
	amount: formatADXPretty(loyaltyPoolStats.balanceLpADX),
	reward: loyaltyPoolStats.rewardADX
		? formatADXPretty(loyaltyPoolStats.rewardADX)
		: "Unknown"
})

export default function Deposits() {
	const [deposits, setDeposits] = useState([])

	const { stats } = useContext(AppContext)

	useEffect(() => {
		if (stats.loyaltyPoolStats.loaded) {
			setDeposits(
				deposits.splice(
					deposits.findIndex(x => x.poolId === "adex-loyalty-pool"),
					1,
					getLoyaltyPoolDeposit(stats.loyaltyPoolStats)
				)
			)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stats])

	const renderDepositRow = deposit => {
		return (
			<TableRow key={deposit.poolId}>
				<TableCell>{deposit.amount}</TableCell>
				<TableCell align="right">{deposit.label}</TableCell>
				<TableCell align="right">{deposit.reward}</TableCell>
				<TableCell align="right">
					<Button
						id={`withdraw-${deposit.poolId}`}
						variant="contained"
						disabled={false}
						onClick={() => {}}
						color="secondary"
					>
						{"Withdraw"}
					</Button>
				</TableCell>
			</TableRow>
		)
	}

	const depositExplanationMsg = `This table will show all your individual ADX deposits, 
	along with information as status, amount and current APY. By using the action buttons, 
	you will be able to request withdraw depending on pool policy`

	const bondExplanationFrag =
		!stats.loaded || stats.userBonds.length ? null : (
			<Box mt={2}>
				<Alert variant="filled" severity="info">
					{depositExplanationMsg}
				</Alert>
			</Box>
		)

	const headerCellStyle = { fontWeight: "bold" }
	return (
		<Box>
			<TableContainer xs={12}>
				<Table aria-label="Bonds table">
					<TableHead>
						<TableRow>
							<TableCell style={headerCellStyle}>Deposit amount</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Pool
							</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Reward
							</TableCell>
							<TableCell style={headerCellStyle} align="right">
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{[...(deposits || [])].map(renderDepositRow)}</TableBody>
				</Table>
			</TableContainer>

			{bondExplanationFrag}
		</Box>
	)
}
