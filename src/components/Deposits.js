import React, { Fragment, useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, TableBody, SvgIcon, TableRow } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { ReactComponent as DepositIcon } from "./../resources/deposit-ic.svg"
import { ReactComponent as WithdrawIcon } from "./../resources/withdraw-ic.svg"
import { ReactComponent as UrlIcon } from "./../resources/url.svg"
import { ReactComponent as LeaveIcon } from "./../resources/leave-ic.svg"
import { InfoOutlined } from "@material-ui/icons"
import { DEPOSIT_POOLS, iconByPoolId, ZERO } from "../helpers/constants"
import { formatADXPretty } from "../helpers/formatting"
import AppContext from "../AppContext"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import { AmountText } from "./cardCommon"
import { DEPOSIT_ACTION_TYPES } from "../actions"
import Tooltip from "./Tooltip"

import { useTranslation } from "react-i18next"
import CustomTable, { StyledTableCell, StyledTableHead } from "./CustomTable"

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
			color: theme.palette.info.main,
			cursor: "pointer"
		},
		warning: {
			color: theme.palette.warning.main
		},
		cellItem: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing(1)
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
	depositsMsg,
	withdrawsMsg,
	leaveMsg,
	rageLeaveMsg,
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
				{/* <Tooltip
					title={
						tomStakingV5PoolStats.leavesPendingToUnlockTotalADX.gt(ZERO) ||
							tomStakingV5PoolStats.leavesReadyToWithdrawTotalADX.gt(ZERO)
							? `${t("deposits.currentBalanceShareADXAvailableValueInfo", {
								// pool: t("common.tomStakingPool"),
								token: "ADX",
								amount: formatADXPretty(
									tomStakingV5PoolStats.currentBalanceSharesADXValue
								),
							})}`
							: ""
					}
				> */}
				<Box>
					<AmountText
						text={`${formatADXPretty(
							// tomStakingV5PoolStats.currentBalanceADXAvailable
							tomStakingV5PoolStats.currentBalanceSharesADXValue
						)} ${"ADX"}`}
						fontSize={17}
					/>
					{hasExternalStakingTokenTransfers && (
						<span className={classes.info}>{" *"}</span>
					)}
					{hasInsufficentBalanceForUnbondCommitments && (
						<span className={classes.info}>
							{" **"}
							{tomStakingV5PoolStats.balanceShares.gt(ZERO) ? " ***" : ""}
						</span>
					)}
				</Box>
				{/* </Tooltip> */}
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
			<Tooltip title={""}>
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
			</Tooltip>
		),
		depositsADXTotal:
			!tomStakingV5PoolStats.depositsADXTotal.isZero() ||
			!tomStakingV5PoolStats.totalSharesInTransfersAdxValue.isZero() ? (
				<Tooltip
					title={
						<Box>
							{!tomStakingV5PoolStats.depositsADXTotal.isZero() && (
								<Box>
									Deposits:{" "}
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.depositsADXTotal
										)} ${"ADX"} `}
										fontSize={17}
									/>
								</Box>
							)}
							{!tomStakingV5PoolStats.totalSharesInTransfersAdxValue.isZero() && (
								<Box>
									Transfers in: ~
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.totalSharesInTransfersAdxValue
										)} ${"ADX"} `}
										fontSize={17}
									/>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;(
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.totalSharesInTransfers
										)} ${"ADX-STAKING"} `}
										fontSize={17}
									/>
									)
								</Box>
							)}
						</Box>
					}
				>
					<Box className={classes.cellItem}>
						<AmountText
							text={`${formatADXPretty(
								tomStakingV5PoolStats.totalInAdxValue
							)} ${"ADX"}`}
							fontSize={17}
						/>
						<InfoOutlined className={classes.info} />
					</Box>
				</Tooltip>
			) : (
				<Box className={classes.cellItem}>
					<AmountText
						text={`${formatADXPretty(
							tomStakingV5PoolStats.totalInAdxValue
						)} ${"ADX"}`}
						fontSize={17}
					/>
				</Box>
			),
		pendingToUnlockTotalADX: (
			<Box>
				<AmountText
					text={`${formatADXPretty(
						tomStakingV5PoolStats.leavesPendingToUnlockTotalADX
					)} ${"ADX"}`}
					fontSize={17}
				/>
				{tomStakingV5PoolStats.leavesPendingToUnlockTotalADX.gt(ZERO) &&
					hasInsufficentBalanceForUnbondCommitments && (
						<Tooltip
							title={`** ${t(
								"deposits.hasInsufficentBalanceForUnbondCommitmentsAlert",
								{
									pool: t("common.tomStakingPool"),
									token: "ADX-STAKING",
									amount: formatADXPretty(
										tomStakingV5PoolStats.insufficientSharesAmoutForCurrentUnbonds
									),
									adxValue: formatADXPretty(
										tomStakingV5PoolStats.currentBalanceSharesADXValue
									)
								}
							)} `}
						>
							<span className={classes.info}>{" **"}</span>
						</Tooltip>
					)}
			</Box>
		),
		withdrawsADXTotal:
			!tomStakingV5PoolStats.withdrawsADXTotal.isZero() ||
			!tomStakingV5PoolStats.totalSharesOutTransfersAdxValue.isZero() ||
			!tomStakingV5PoolStats.rageLeavesWithdrawnADXTotal.isZero() ? (
				<Tooltip
					title={
						<Box>
							{!tomStakingV5PoolStats.withdrawsADXTotal.isZero() && (
								<Box>
									Withdraws:{" "}
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.withdrawsADXTotal
										)} ${"ADX"} `}
										fontSize={17}
									/>
								</Box>
							)}
							{!tomStakingV5PoolStats.totalSharesOutTransfersAdxValue.isZero() && (
								<Box>
									Transfers out: ~
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.totalSharesOutTransfersAdxValue
										)} ${"ADX"} `}
										fontSize={17}
									/>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;(
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.totalSharesOutTransfers
										)} ${"ADX-STAKING"} `}
										fontSize={17}
									/>
									)
								</Box>
							)}
							{!tomStakingV5PoolStats.rageLeavesWithdrawnADXTotal.isZero() && (
								<Box>
									Reage leaves:
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp; Withdrawn{" "}
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.rageLeavesWithdrawnADXTotal
										)} ${"ADX"} `}
										fontSize={17}
									/>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp; Received{" "}
									<AmountText
										text={`${formatADXPretty(
											tomStakingV5PoolStats.rageLeavesReceivedADXTotal
										)} ${"ADX"} `}
										fontSize={17}
									/>
								</Box>
							)}
						</Box>
					}
				>
					<Box className={classes.cellItem}>
						<AmountText
							text={`${formatADXPretty(
								tomStakingV5PoolStats.totalOutAdxValue
							)} ${"ADX"} `}
							fontSize={17}
						/>
						<InfoOutlined className={classes.info} />
						{/* {hasExternalStakingTokenTransfers && (
						<span className={classes.info}>{" *"}</span>
					)} */}
					</Box>
				</Tooltip>
			) : (
				<Box className={classes.cellItem}>
					<AmountText
						text={`${formatADXPretty(
							tomStakingV5PoolStats.totalOutAdxValue
						)} ${"ADX"} `}
						fontSize={17}
					/>
					{/* {hasExternalStakingTokenTransfers && (
			<span className={classes.info}>{" *"}</span>
		)} */}
				</Box>
			),
		readyToWithdrawTotalADX: (
			<Box className={classes.cellItem}>
				<AmountText
					text={`${formatADXPretty(
						tomStakingV5PoolStats.leavesReadyToWithdrawTotalADX
					)} ${"ADX"} `}
					fontSize={17}
				/>
				{tomStakingV5PoolStats.leavesReadyToWithdrawTotalADX.gt(ZERO) &&
					hasInsufficentBalanceForUnbondCommitments && (
						<Tooltip
							title={`** ${t(
								"deposits.hasInsufficentBalanceForUnbondCommitmentsAlert",
								{
									pool: t("common.tomStakingPool"),
									token: "ADX-STAKING",
									amount: formatADXPretty(
										tomStakingV5PoolStats.insufficientSharesAmoutForCurrentUnbonds
									),
									adxValue: formatADXPretty(
										tomStakingV5PoolStats.currentBalanceSharesADXValue
									)
								}
							)} `}
						>
							<span className={classes.info}>{" **"}</span>
						</Tooltip>
					)}
			</Box>
		),
		actions: [
			<DepositsDialog
				id="staking-pool-tom-deposit-form"
				title={t("deposits.depositTo", { pool: t("common.tomStakingPool") })}
				size="small"
				btnType="icon"
				icon={<DepositIcon />}
				disabled={!!disabledDepositsMsg}
				tooltipTitle={disabledDepositsMsg ? disabledDepositsMsg : depositsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				actionType={DEPOSIT_ACTION_TYPES.deposit}
			/>,
			<DepositsDialog
				id="staking-pool-tom-leave-form"
				btnType="icon"
				icon={<UrlIcon />}
				disabled={!!disableActionsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				tooltipTitle={disableActionsMsg ? disableActionsMsg : leaveMsg}
				actionType={DEPOSIT_ACTION_TYPES.unbondCommitment}
			/>,
			<DepositsDialog
				id="staking-pool-tom-withdraw-form"
				btnType="icon"
				icon={<WithdrawIcon />}
				disabled={!!disabledWithdrawsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				tooltipTitle={
					disabledWithdrawsMsg ? disabledWithdrawsMsg : withdrawsMsg
				}
				actionType={DEPOSIT_ACTION_TYPES.withdraw}
			/>,
			<DepositsDialog
				id="staking-pool-tom-rage-leave-form"
				btnType="icon"
				icon={<LeaveIcon />}
				disabled={!!disableActionsMsg}
				depositPool={DEPOSIT_POOLS[1].id}
				tooltipTitle={disableActionsMsg ? disableActionsMsg : rageLeaveMsg}
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
	depositsMsg,
	withdrawsMsg,
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
						text={`${formatADXPretty(loyaltyPoolStats.balanceLpADX)} ${"ADX"} `}
						fontSize={17}
					/>
					{hasExternalStakingTokenTransfers && (
						<span className={classes.info}> *</span>
					)}
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
					text={`${formatADXPretty(loyaltyPoolStats.totalRewards)} ${"ADX"} `}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}> *</span>
				)}
			</Box>
		) : (
			t("common.unknown")
		),
		depositsADXTotal: loyaltyPoolStats.totalDeposits ? (
			<Box>
				<AmountText
					text={`${formatADXPretty(loyaltyPoolStats.totalDeposits)} ${"ADX"} `}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}> *</span>
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
					text={`${formatADXPretty(loyaltyPoolStats.totalWithdraws)} ${"ADX"} `}
					fontSize={17}
				/>
				{hasExternalStakingTokenTransfers && (
					<span className={classes.info}> *</span>
				)}
			</Box>
		) : (
			t("common.unknown")
		),
		actions: [
			<DepositsDialog
				id="loyalty-pool-deposit-form"
				btnType="icon"
				icon={<DepositIcon />}
				disabled={!!disabledDepositsMsg}
				tooltipTitle={disabledDepositsMsg ? disabledDepositsMsg : depositsMsg}
				depositPool={DEPOSIT_POOLS[0].id}
				actionType={DEPOSIT_ACTION_TYPES.deposit}
			/>,
			<DepositsDialog
				id="loyalty-pool-withdraw-form"
				btnType="icon"
				icon={<WithdrawIcon />}
				disabled={!!disabledWithdrawsMsg}
				depositPool={DEPOSIT_POOLS[0].id}
				tooltipTitle={
					disabledWithdrawsMsg ? disabledWithdrawsMsg : withdrawsMsg
				}
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
	const { stats, chosenWalletType, account } = useContext(AppContext)
	const { loyaltyPoolStats, tomStakingV5PoolStats } = stats

	const {
		totalSharesOutTransfersAdxValue,
		totalSharesInTransfersAdxValue,
		hasInsufficentBalanceForUnbondCommitments,
		insufficientSharesAmoutForCurrentUnbonds,
		currentBalanceSharesADXValue,
		balanceShares,
		rageLeavesWithdrawnADXTotal
	} = tomStakingV5PoolStats

	const {
		totalSharesOutTransfersAdxValue: totalSharesOutTransfersAdxValueLP,
		totalSharesInTransfersAdxValue: totalSharesInTransfersAdxValueLP
	} = loyaltyPoolStats

	const hasExternalStakingTokenTransfers =
		!totalSharesOutTransfersAdxValue.isZero() ||
		!totalSharesInTransfersAdxValue.isZero() ||
		!rageLeavesWithdrawnADXTotal.isZero()

	const hasExternalStakingTokenTransfersLP =
		!totalSharesOutTransfersAdxValueLP.isZero() ||
		!totalSharesInTransfersAdxValueLP.isZero()

	const disableActionsMsg = !chosenWalletType.name
		? t("common.connectWallet")
		: !loyaltyPoolStats.loaded
		? t("common.loadingData")
		: ""

	const leaveMsg = t("eventTypes.leave")
	const rageLeaveMsg = t("eventTypes.rageLeave")

	// TODO: UPDATE if more deposit pools
	const disableDepositsMsg =
		disableActionsMsg ||
		(loyaltyPoolStats.poolTotalStaked.gte(loyaltyPoolStats.poolDepositsLimit)
			? t("deposits.depositsLimitReached")
			: "")

	const depositsMsg = t("common.deposit")

	useEffect(() => {
		const {
			loyaltyPoolStats,
			tomStakingV5PoolStats,
			connectedWalletAddress
		} = stats
		// if (connectedWalletAddress !== account) {
		// 	setDeposits([])
		// 	return
		// }

		let loadedDeposits = [...deposits]
		if (loyaltyPoolStats.loaded) {
			// const disabledDepositsMsg = !chosenWalletType.name ?
			// 	'Connect wallet' :
			// 	(loyaltyPoolStats.poolTotalStaked.gte(loyaltyPoolStats.poolDepositsLimit) ?
			// 		'Pool deposits limit reached' : ''
			// 	)
			const disabledWithdrawsMsg = disableActionsMsg
			const withdrawsMsg = t("eventTypes.withdraw")

			const loyaltyPoolDeposit = getLoyaltyPoolDeposit({
				classes,
				t,
				stats,
				disabledDepositsMsg: disableDepositsMsg,
				disabledWithdrawsMsg,
				depositsMsg: depositsMsg,
				withdrawsMsg: withdrawsMsg,
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

			const withdrawsMsg = t("eventTypes.withdraw")

			const stakingPoolDeposit = getStakingPool({
				classes,
				t,
				stats,
				disableActionsMsg,
				disabledDepositsMsg: disableDepositsMsg,
				disabledWithdrawsMsg,
				depositsMsg: depositsMsg,
				withdrawsMsg: withdrawsMsg,
				leaveMsg: leaveMsg,
				rageLeaveMsg: rageLeaveMsg,
				hasExternalStakingTokenTransfers,
				hasInsufficentBalanceForUnbondCommitments
			})

			loadedDeposits = updateDeposits(loadedDeposits, stakingPoolDeposit)
		}

		setDeposits(loadedDeposits)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stats, account])

	const renderDepositRow = deposit => {
		const PoolIcon = iconByPoolId(deposit)
		return (
			<TableRow key={deposit.poolId}>
				<StyledTableCell>
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
				</StyledTableCell>
				<StyledTableCell>{`${(deposit.currentAPY * 100).toFixed(
					2
				)} % `}</StyledTableCell>
				<StyledTableCell>{deposit.balance}</StyledTableCell>
				<StyledTableCell>{deposit.allTimeReward}</StyledTableCell>
				<StyledTableCell>{deposit.depositsADXTotal}</StyledTableCell>
				<StyledTableCell>{deposit.withdrawsADXTotal}</StyledTableCell>
				<StyledTableCell>{deposit.pendingToUnlockTotalADX}</StyledTableCell>
				<StyledTableCell>{deposit.readyToWithdrawTotalADX}</StyledTableCell>
				<StyledTableCell>
					<Box
						display="flex"
						flexDirection="row"
						alignItems="stretch"
						justifyContent="flex-start"
					>
						{deposit.actions.map((action, index) => (
							<Box key={index} my={0.25}>
								{action}
							</Box>
						))}
					</Box>
				</StyledTableCell>
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
			<CustomTable>
				<StyledTableHead>
					<TableRow>
						<StyledTableCell>{t("common.pool")}</StyledTableCell>
						<StyledTableCell>{t("common.APY")}</StyledTableCell>
						<StyledTableCell>{t("common.balance")}</StyledTableCell>
						<StyledTableCell>{t("deposits.allTimeRewards")}</StyledTableCell>
						<StyledTableCell>{t("deposits.depositsADXTotal")}</StyledTableCell>
						<StyledTableCell>{t("deposits.withdrawsADXTotal")}</StyledTableCell>
						<StyledTableCell>
							{t("deposits.pendingToUnlockTotal")}
						</StyledTableCell>
						<StyledTableCell>
							{t("deposits.readyToWithdrawTotal")}
						</StyledTableCell>
						<StyledTableCell>{t("common.actions")}</StyledTableCell>
					</TableRow>
				</StyledTableHead>
				<TableBody>{[...(deposits || [])].map(renderDepositRow)}</TableBody>
			</CustomTable>
			{hasExternalStakingTokenTransfers && (
				<Box mb={1}>
					<Alert variant="filled" severity="info">
						{`* ${t("deposits.hasExternalStakingTokenTransfersAlert", {
							pool: t("common.tomStakingPool"),
							token: "ADX-STAKING"
						})} `}
					</Alert>
				</Box>
			)}
			{hasExternalStakingTokenTransfersLP && (
				<Box mb={1}>
					<Alert variant="filled" severity="info">
						{`* ${t("deposits.hasExternalStakingTokenTransfersAlert", {
							pool: t("common.loPo"),
							token: "ADX-LOYALTY"
						})} `}
					</Alert>
				</Box>
			)}
			{hasInsufficentBalanceForUnbondCommitments && (
				<Box mb={1}>
					<Alert variant="filled" severity="info">
						{`** ${t(
							"deposits.hasInsufficentBalanceForUnbondCommitmentsAlert",
							{
								pool: t("common.tomStakingPool"),
								token: "ADX-STAKING",
								amount: formatADXPretty(
									insufficientSharesAmoutForCurrentUnbonds
								),
								adxValue: formatADXPretty(currentBalanceSharesADXValue)
							}
						)} `}
					</Alert>
				</Box>
			)}
			{hasInsufficentBalanceForUnbondCommitments && balanceShares.gt(ZERO) && (
				<Box mb={1}>
					<Alert variant="filled" severity="info">
						{`*** ${t("deposits.currentBalanceShareADXAvailableValueInfo", {
							// pool: t("common.tomStakingPool"),
							token: "ADX-STAKING",
							amount: formatADXPretty(balanceShares)
						})} `}
					</Alert>
				</Box>
			)}
		</Box>
	)
}
