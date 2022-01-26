import React, { Fragment, useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	SvgIcon
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { DEPOSIT_POOLS, iconByPoolId, ZERO } from "../helpers/constants"
import { formatADXPretty } from "../helpers/formatting"
import AppContext from "../AppContext"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import { AmountText } from "./cardCommon"
import { DEPOSIT_ACTION_TYPES } from "../actions"
import Tooltip from "./Tooltip"

import { useTranslation } from "react-i18next"

const DepositsDialog = WithDialog(DepositForm)

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "100%",
			width: 42,
			height: 42,
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center"
		},
		info: {
			color: theme.palette.info.main
		},
		warning: {
			color: theme.palette.warning.main
		}
	}
})

const getStakingPool = ({
	classes,
	t,
	stats,
	disabledDepositsMsg,
	disabledWithdrawsMsg,
	disableActionsMsg,
	hasExternalStakingTokenTransfers,
	hasInsufficentBalanceForUnbondCommitments
}) => {
	const { tomStakingV5PoolStats } = stats

	return {
		poolId: "adex-staking-pool",
		label: t("common.tomStakingPool"),
		currentAPY: tomStakingV5PoolStats.currentAPY,
		balance: (
			<Fragment>
				<Tooltip
					title={
						tomStakingV5PoolStats.leavesPendingToUnlockTotalADX.gt(ZERO) ||
						tomStakingV5PoolStats.leavesReadyToWithdrawTotalADX.gt(ZERO)
							? `${t("deposits.currentBalanceShareADXAvailableValueInfo", {
									// pool: t("common.tomStakingPool"),
									token: "ADX",
									amount: formatADXPretty(
										tomStakingV5PoolStats.currentBalanceSharesADXValue
									),
									amountStaking: formatADXPretty(
										tomStakingV5PoolStats.balanceShares
									)
							  })}`
							: ""
					}
				>
					<Box>
						<AmountText
							text={`${formatADXPretty(
								tomStakingV5PoolStats.currentBalanceADXAvailable
								// tomStakingV5PoolStats.currentBalanceSharesADXValue
							)} ${"ADX"}`}
							fontSize={17}
						/>
						{hasExternalStakingTokenTransfers && (
							<span className={classes.info}>{" *"}</span>
						)}
						{hasInsufficentBalanceForUnbondCommitments && (
							<span className={classes.warning}>{" ** ***"}</span>
						)}
					</Box>
				</Tooltip>
				<Box>
					{/* <AmountText
						text={`(=${formatADXPretty(
							tomStakingV5PoolStats.balanceShares
						)} ${"shares"})`}
						fontSize={17}
					/> */}
					<Box>
						{`(${t("deposits.poolShare")}: ${(
							tomStakingV5PoolStats.userShare * 100
						).toFixed(4)}%)`}
					</Box>
				</Box>
			</Fragment>
		),
		allTimeReward: (
			<Box>
				<AmountText
					text={`${formatADXPretty(
						tomStakingV5PoolStats.totalRewards
					)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}>{" *"}</span>
				)}
			</Box>
		),
		depositsADXTotal: (
			<Box>
				<AmountText
					text={`${formatADXPretty(
						tomStakingV5PoolStats.depositsADXTotal
					)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}>{" *"}</span>
				)}
			</Box>
		),
		pendingToUnlockTotalADX: (
			<AmountText
				text={`${formatADXPretty(
					tomStakingV5PoolStats.leavesPendingToUnlockTotalADX
				)} ${"ADX"}`}
				fontSize={17}
			/>
		),
		withdrawsADXTotal: (
			<Box>
				<AmountText
					text={`${formatADXPretty(
						tomStakingV5PoolStats.withdrawsADXTotal
					)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}>{" *"}</span>
				)}
			</Box>
		),
		readyToWithdrawTotalADX: (
			<Box>
				<AmountText
					text={`${formatADXPretty(
						tomStakingV5PoolStats.leavesReadyToWithdrawTotalADX
					)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasInsufficentBalanceForUnbondCommitments && (
					<span className={classes.warning}>{" **"}</span>
				)}
			</Box>
		),
		actions: [
			<DepositsDialog
				id="staking-pool-tom-deposit-form"
				title={t("deposits.depositTo", { pool: t("common.tomStakingPool") })}
				btnLabel={t("common.deposit")}
				color="secondary"
				size="small"
				variant="contained"
				fullWidth
				disabled={!!disabledDepositsMsg}
				tooltipTitle={disabledDepositsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				actionType={DEPOSIT_ACTION_TYPES.deposit}
			/>,
			<DepositsDialog
				id="staking-pool-tom-leave-form"
				title={t("deposits.unbondCommitmentFrom", {
					pool: t("common.tomStakingPool")
				})}
				btnLabel={t("common.unbond")}
				color="default"
				size="small"
				variant="contained"
				fullWidth
				disabled={!!disableActionsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				tooltipTitle={disableActionsMsg}
				actionType={DEPOSIT_ACTION_TYPES.unbondCommitment}
			/>,
			<DepositsDialog
				id="staking-pool-tom-withdraw-form"
				title={t("deposits.withdrawFrom", { pool: t("common.tomStakingPool") })}
				btnLabel={t("common.withdraw")}
				color="default"
				size="small"
				variant="contained"
				fullWidth
				disabled={!!disabledWithdrawsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				tooltipTitle={disabledWithdrawsMsg}
				actionType={DEPOSIT_ACTION_TYPES.withdraw}
			/>,
			<DepositsDialog
				id="staking-pool-tom-rage-leave-form"
				title={t("deposits.rageLeaveFrom", {
					pool: t("common.tomStakingPool")
				})}
				btnLabel={t("deposits.rageLeave")}
				color="default"
				size="small"
				variant="contained"
				fullWidth
				disabled={!!disableActionsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				tooltipTitle={disableActionsMsg}
				actionType={DEPOSIT_ACTION_TYPES.rageLeave}
			/>
		]
	}
}

const getLoyaltyPoolDeposit = ({
	classes,
	t,
	stats,
	disabledDepositsMsg,
	disabledWithdrawsMsg,
	hasExternalStakingTokenTransfers
}) => {
	const { loyaltyPoolStats } = stats
	return {
		poolId: "adex-loyalty-pool",
		label: t("common.loPo"),
		currentAPY: loyaltyPoolStats.currentAPY,
		balance: (
			<Fragment>
				<Box>
					<AmountText
						text={`${formatADXPretty(loyaltyPoolStats.balanceLpADX)} ${"ADX"}`}
						fontSize={17}
					/>
					{hasExternalStakingTokenTransfers && " *"}
				</Box>
				{
					<Box>{`(${t("deposits.poolShare")}: ${(
						loyaltyPoolStats.userShare * 100
					).toFixed(4)}%)`}</Box>
				}
			</Fragment>
		),
		allTimeReward: loyaltyPoolStats.totalRewards ? (
			<Box>
				<AmountText
					text={`${formatADXPretty(loyaltyPoolStats.totalRewards)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && " *"}
			</Box>
		) : (
			t("common.unknown")
		),
		depositsADXTotal: loyaltyPoolStats.totalDeposits ? (
			<Box>
				<AmountText
					text={`${formatADXPretty(loyaltyPoolStats.totalDeposits)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}>" *"</span>
				)}
			</Box>
		) : (
			t("common.unknown")
		),
		pendingToUnlockTotalADX: t("common.NA"),
		readyToWithdrawTotalADX: t("common.NA"),
		withdrawsADXTotal: loyaltyPoolStats.totalWithdraws ? (
			<Box>
				<AmountText
					text={`${formatADXPretty(loyaltyPoolStats.totalWithdraws)} ${"ADX"}`}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && " *"}
			</Box>
		) : (
			t("common.unknown")
		),
		actions: [
			<DepositsDialog
				id="loyalty-pool-deposit-form"
				title={t("deposits.depositTo", { pool: t("common.loPo") })}
				btnLabel={t("common.deposit")}
				color="secondary"
				size="small"
				variant="contained"
				fullWidth
				disabled={!!disabledDepositsMsg}
				tooltipTitle={disabledDepositsMsg}
				depositPool={DEPOSIT_POOLS[0].id}
				actionType={DEPOSIT_ACTION_TYPES.deposit}
			/>,
			<DepositsDialog
				id="loyalty-pool-withdraw-form"
				title={t("deposits.withdrawFrom", { pool: t("common.loPo") })}
				btnLabel={t("common.withdraw")}
				color="default"
				size="small"
				variant="contained"
				fullWidth
				disabled={!!disabledWithdrawsMsg}
				depositPool={DEPOSIT_POOLS[0].id}
				tooltipTitle={disabledWithdrawsMsg}
				actionType={DEPOSIT_ACTION_TYPES.withdraw}
			/>
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
	const { t } = useTranslation()
	const classes = useStyles()
	const [deposits, setDeposits] = useState([])
	const { stats, chosenWalletType } = useContext(AppContext)
	const { loyaltyPoolStats, tomStakingV5PoolStats } = stats

	const {
		totalSharesOutTransfersAdxValue,
		totalSharesInTransfersAdxValue,
		hasInsufficentBalanceForUnbondCommitments,
		insufficientSharesAmoutForCurrentUnbonds,
		currentBalanceSharesADXValue,
		balanceShares
	} = tomStakingV5PoolStats

	const {
		totalSharesOutTransfersAdxValue: totalSharesOutTransfersAdxValueLP,
		totalSharesInTransfersAdxValue: totalSharesInTransfersAdxValueLP
	} = loyaltyPoolStats

	const hasExternalStakingTokenTransfers =
		!totalSharesOutTransfersAdxValue.isZero() ||
		!totalSharesInTransfersAdxValue.isZero()

	const hasExternalStakingTokenTransfersLP =
		!totalSharesOutTransfersAdxValueLP.isZero() ||
		!totalSharesInTransfersAdxValueLP.isZero()

	const disableActionsMsg = !chosenWalletType.name
		? t("common.connectWallet")
		: !loyaltyPoolStats.loaded
		? t("common.loadingData")
		: ""

	// TODO: UPDATE if more deposit pools
	const disableDepositsMsg =
		disableActionsMsg ||
		(loyaltyPoolStats.poolTotalStaked.gte(loyaltyPoolStats.poolDepositsLimit)
			? t("deposits.depositsLimitReached")
			: "")

	useEffect(() => {
		const { loyaltyPoolStats, tomStakingV5PoolStats } = stats
		let loadedDeposits = [...deposits]
		if (loyaltyPoolStats.loaded) {
			// const disabledDepositsMsg = !chosenWalletType.name ?
			// 	'Connect wallet' :
			// 	(loyaltyPoolStats.poolTotalStaked.gte(loyaltyPoolStats.poolDepositsLimit) ?
			// 		'Pool deposits limit reached' : ''
			// 	)
			const disabledWithdrawsMsg = disableActionsMsg

			const loyaltyPoolDeposit = getLoyaltyPoolDeposit({
				t,
				stats,
				disabledDepositsMsg: disableDepositsMsg,
				disabledWithdrawsMsg,
				hasExternalStakingTokenTransfers: hasExternalStakingTokenTransfersLP
			})
			loadedDeposits = updateDeposits(loadedDeposits, loyaltyPoolDeposit)
		}

		if (tomStakingV5PoolStats.loaded) {
			const disableDepositsMsg = disableActionsMsg

			const disabledWithdrawsMsg =
				disableActionsMsg ||
				(!tomStakingV5PoolStats.hasActiveUnbondCommitments
					? t("deposits.unbondToWithdraw")
					: "")

			const stakingPoolDeposit = getStakingPool({
				classes,
				t,
				stats,
				disableActionsMsg,
				disabledDepositsMsg: disableDepositsMsg,
				disabledWithdrawsMsg,
				hasExternalStakingTokenTransfers,
				hasInsufficentBalanceForUnbondCommitments
			})

			loadedDeposits = updateDeposits(loadedDeposits, stakingPoolDeposit)
		}

		setDeposits(loadedDeposits)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stats])

	const renderDepositRow = deposit => {
		const PoolIcon = iconByPoolId(deposit)
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
				<TableCell align="right">{`${(deposit.currentAPY * 100).toFixed(
					2
				)} %`}</TableCell>
				<TableCell align="right">{deposit.balance}</TableCell>
				<TableCell align="right">{deposit.allTimeReward}</TableCell>
				<TableCell align="right">{deposit.depositsADXTotal}</TableCell>
				<TableCell align="right">{deposit.withdrawsADXTotal}</TableCell>
				<TableCell align="right">{deposit.pendingToUnlockTotalADX}</TableCell>
				<TableCell align="right">{deposit.readyToWithdrawTotalADX}</TableCell>
				<TableCell align="center">
					<Box
						display="flex"
						flexDirection="column"
						alignItems="stretch"
						justifyContent="center"
					>
						{deposit.actions.map((action, index) => (
							<Box key={index} my={0.25}>
								{action}
							</Box>
						))}
					</Box>
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
			<Box mb={2}>
				<TableContainer xs={12}>
					<Table aria-label="Bonds table">
						<TableHead>
							<TableRow>
								<TableCell>{t("common.pool")}</TableCell>
								<TableCell>{t("common.APY")}</TableCell>
								<TableCell align="right">{t("common.balance")}</TableCell>
								<TableCell align="right">
									{t("deposits.allTimeRewards")}
								</TableCell>
								<TableCell align="right">
									{t("deposits.depositsADXTotal")}
								</TableCell>
								<TableCell align="right">
									{t("deposits.withdrawsADXTotal")}
								</TableCell>
								<TableCell align="right">
									{t("deposits.pendingToUnlockTotal")}
								</TableCell>
								<TableCell align="right">
									{t("deposits.readyToWithdrawTotal")}
								</TableCell>
								<TableCell align="right">{t("common.actions")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{[...(deposits || [])].map(renderDepositRow)}</TableBody>
					</Table>
				</TableContainer>
			</Box>
			{hasExternalStakingTokenTransfers && (
				<Box mb={1}>
					<Alert variant="filled" severity="info">
						{`* ${t("deposits.hasExternalStakingTokenTransfersAlert", {
							pool: t("common.tomStakingPool"),
							token: "ADX-STAKING"
						})}`}
					</Alert>
				</Box>
			)}
			{hasExternalStakingTokenTransfersLP && (
				<Box mb={1}>
					<Alert variant="filled" severity="info">
						{`* ${t("deposits.hasExternalStakingTokenTransfersAlert", {
							pool: t("common.loPo"),
							token: "ADX-LOYALTY"
						})}`}
					</Alert>
				</Box>
			)}
			{hasInsufficentBalanceForUnbondCommitments && (
				<Box mb={1}>
					<Alert variant="filled" severity="warning">
						{`** ${t(
							"deposits.hasInsufficentBalanceForUnbondCommitmentsAlert",
							{
								pool: t("common.tomStakingPool"),
								token: "ADX-STAKING",
								amount: formatADXPretty(
									insufficientSharesAmoutForCurrentUnbonds.mul(-1)
								),
								adxValue: formatADXPretty(currentBalanceSharesADXValue)
							}
						)}`}
					</Alert>
				</Box>
			)}
			{hasInsufficentBalanceForUnbondCommitments && (
				<Box mb={1}>
					<Alert variant="filled" severity="warning">
						{`*** ${t("deposits.currentBalanceShareADXAvailableValueInfo", {
							// pool: t("common.tomStakingPool"),
							token: "ADX-STAKING",
							amount: formatADXPretty(balanceShares)
						})}`}
					</Alert>
				</Box>
			)}
		</Box>
	)
}
