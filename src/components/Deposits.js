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
import { formatADXPretty, toIdAttributeString } from "../helpers/formatting"
import AppContext from "../AppContext"
import { onLoyaltyPoolDeposit } from "../actions"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"

const DepositsDialog = WithDialog(DepositForm)

const getLoyaltyPoolDeposit = (stats, chosenWalletType) => {
	const { loyaltyPoolStats } = stats
	return {
		poolId: "adex-loyalty-pool",
		label: "Loyalty Pool",
		balance: `${formatADXPretty(
			loyaltyPoolStats.balanceLpADX
		)} ADX, ${formatADXPretty(loyaltyPoolStats.balanceLpToken)} ADX-LOYALTY`,
		reward: loyaltyPoolStats.rewardADX
			? formatADXPretty(loyaltyPoolStats.rewardADX)
			: "Unknown",
		actions: [
			{
				id: toIdAttributeString(`withdraw-loyalty-pool-btn`),
				label: "Withdraw",
				onClick: () =>
					onLoyaltyPoolDeposit(
						stats,
						chosenWalletType,
						loyaltyPoolStats.balanceLpADX
					),
				disabled: false
			}
		]
	}
}

const updateDeposits = (deposits, newDeposit) => {
	const index = deposits.findIndex(x => x.poolId === newDeposit.poolId)
	const newDeposits = [...deposits]

	if (index > -1) {
		newDeposits[index] = newDeposit
	} else {
		newDeposits.push(newDeposit)
	}

	return newDeposits
}

export default function Deposits() {
	const [deposits, setDeposits] = useState([])

	const { stats, chosenWalletType } = useContext(AppContext)

	useEffect(() => {
		if (stats.loyaltyPoolStats.loaded) {
			const loyaltyPoolDeposit = getLoyaltyPoolDeposit(stats, chosenWalletType)
			setDeposits(updateDeposits(deposits, loyaltyPoolDeposit))
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stats])

	console.log("deposits", deposits)
	const renderDepositRow = deposit => {
		return (
			<TableRow key={deposit.poolId}>
				<TableCell>{deposit.label}</TableCell>
				<TableCell align="right">{deposit.balance}</TableCell>
				<TableCell align="right">{deposit.reward}</TableCell>
				<TableCell align="right">
					{deposit.actions.map(({ id, label, disabled, onClick }) => (
						<Button
							key={id}
							id={id}
							variant="contained"
							disabled={false}
							onClick={onClick}
							color="secondary"
						>
							{label}
						</Button>
					))}
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
			<Box>
				<DepositsDialog
					title="Add new deposit"
					btnLabel="New Deposit"
					color="secondary"
					size="large"
					variant="contained"
					disabled={!chosenWalletType.name}
				/>
			</Box>
			<Box>
				<TableContainer xs={12}>
					<Table aria-label="Bonds table">
						<TableHead>
							<TableRow>
								<TableCell style={headerCellStyle}>Pool</TableCell>
								<TableCell style={headerCellStyle} align="right">
									Balance
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
		</Box>
	)
}
