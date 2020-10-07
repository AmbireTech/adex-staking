import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	SvgIcon,
} from "@material-ui/core"
import { DEPOSIT_POOLS } from "../helpers/constants"
import { formatADXPretty } from "../helpers/formatting"
import AppContext from "../AppContext"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import { ReactComponent as LoyaltyIcon } from "./../resources/loyalty-ic.svg"

const iconByPoolId = (poolId) => {
	switch (poolId) {
		case "adex-loyalty-pool":
			return LoyaltyIcon
		default:
			return null
	}
}

const DepositsDialog = WithDialog(DepositForm)

const useStyles = makeStyles((theme) => {
	return {
		iconBox: {
			borderRadius: "100%",
			width: 42,
			height: 42,
			backgroundColor: theme.palette.common.white,
			color: theme.palette.background.default,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
		},
	}
})

const getLoyaltyPoolDeposit = ({
	stats,
	disabledDepositsMsg,
	disabledWithdrawsMsg,
}) => {
	const { loyaltyPoolStats } = stats
	return {
		poolId: "adex-loyalty-pool",
		label: "Loyalty Pool",
		balance: `
		${formatADXPretty(loyaltyPoolStats.balanceLpToken)} ADX-LOYALTY
		(= ${formatADXPretty(loyaltyPoolStats.balanceLpADX)} ADX)
		`,
		reward: `${
			loyaltyPoolStats.rewardADX
				? formatADXPretty(loyaltyPoolStats.rewardADX)
				: "Unknown"
		} ADX`,
		actions: [
			<DepositsDialog
				id="loyalty-pool-deposit-form"
				title="Add new deposit"
				btnLabel="Deposit"
				color="secondary"
				size="small"
				variant="contained"
				disabled={!!disabledDepositsMsg}
				tooltipTitle={disabledDepositsMsg}
				depositPool={DEPOSIT_POOLS[0].id}
			/>,
			<DepositsDialog
				id="loyalty-pool-withdraw-form"
				title="Withdraw from loyalty pool"
				btnLabel="Withdraw"
				color="default"
				size="small"
				variant="contained"
				disabled={!!disabledWithdrawsMsg}
				depositPool={DEPOSIT_POOLS[0].id}
				tooltipTitle={disabledWithdrawsMsg}
				withdraw
			/>,
		],
	}
}

const updateDeposits = (deposits, newDeposit) => {
	const index = deposits.findIndex((x) => x.poolId === newDeposit.poolId)
	const newDeposits = [...deposits]

	if (index > -1) {
		newDeposits[index] = newDeposit
	} else {
		newDeposits.push(newDeposit)
	}

	return newDeposits
}

export default function Deposits() {
	const classes = useStyles()

	const [deposits, setDeposits] = useState([])

	const { stats, chosenWalletType } = useContext(AppContext)

	const { loyaltyPoolStats } = stats

	// TODO: UPDATE if more deposit pools
	const disableDepositsMsg = !chosenWalletType.name
		? "Connect wallet"
		: !loyaltyPoolStats.loaded
		? "Loading data"
		: loyaltyPoolStats.poolTotalStaked.gte(loyaltyPoolStats.poolDepositsLimit)
		? "Pool deposits limit reached"
		: ""

	useEffect(() => {
		const { loyaltyPoolStats } = stats
		if (loyaltyPoolStats.loaded) {
			// const disabledDepositsMsg = !chosenWalletType.name ?
			// 	'Connect wallet' :
			// 	(loyaltyPoolStats.poolTotalStaked.gte(loyaltyPoolStats.poolDepositsLimit) ?
			// 		'Pool deposits limit reached' : ''
			// 	)
			const disabledWithdrawsMsg = !chosenWalletType.name
				? "Connect wallet"
				: ""

			const loyaltyPoolDeposit = getLoyaltyPoolDeposit({
				stats,
				disabledDepositsMsg: disableDepositsMsg,
				disabledWithdrawsMsg,
			})
			setDeposits(updateDeposits(deposits, loyaltyPoolDeposit))
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stats])

	const renderDepositRow = (deposit) => {
		const PoolIcon = iconByPoolId(deposit.poolId)
		return (
			<TableRow key={deposit.poolId}>
				<TableCell>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="center"
						justifyContent="flex-start"
					>
						{PoolIcon && (
							<Box mr={1}>
								<Box classes={{ root: classes.iconBox }}>
									<SvgIcon fontSize="large" color="inherit">
										<PoolIcon width="100%" height="100%" />
									</SvgIcon>
								</Box>
							</Box>
						)}
						<Box>{deposit.label}</Box>
					</Box>
				</TableCell>
				<TableCell align="right">{deposit.balance}</TableCell>
				<TableCell align="right">{deposit.reward}</TableCell>
				<TableCell align="right">
					{deposit.actions.map((action, index) => (
						<Box key={index} display="inline-block" m={0.5}>
							{action}
						</Box>
					))}
				</TableCell>
			</TableRow>
		)
	}

	return (
		<Box>
			{/* <Box>
				<DepositsDialog
					id="deposits-table-open-deposit-modal-btn"
					title="Add new deposit"
					btnLabel="New Deposit"
					color="secondary"
					size="large"
					variant="contained"
					disabled={!!disableDepositsMsg}
					tooltipTitle={disableDepositsMsg}
				/>
			</Box> */}
			<Box>
				<TableContainer xs={12}>
					<Table aria-label="Bonds table">
						<TableHead>
							<TableRow>
								<TableCell>Pool</TableCell>
								<TableCell align="right">Balance</TableCell>
								<TableCell align="right">Reward</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{[...(deposits || [])].map(renderDepositRow)}</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	)
}
