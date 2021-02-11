import React, { useContext, useState } from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	Typography,
	Tooltip,
	Button
} from "@material-ui/core"
import { formatADXPretty, formatDateTime } from "../helpers/formatting"
import AppContext from "../AppContext"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import { AmountText } from "./cardCommon"
import { useTranslation } from "react-i18next"
import { DEPOSIT_POOLS, ZERO } from "../helpers/constants"
import { STAKING_POOL_EVENT_TYPES, onStakingPoolV5Withdraw } from "../actions"
import { ExternalAnchor } from "./Anchor"
import ConfirmationDialog from "./ConfirmationDialog"

const DepositsDialog = WithDialog(DepositForm)

const StakingEventRow = ({
	stakingEvent,
	setWithdrawEvent,
	disableWithdrawMsg,
	setWithdrawOpen
}) => {
	const { t } = useTranslation()
	return (
		<TableRow key={stakingEvent.blockNumber + stakingEvent.type}>
			<TableCell>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-start"
				>
					<Box>{stakingEvent.label}</Box>
				</Box>
			</TableCell>
			<TableCell align="right">{stakingEvent.type}</TableCell>
			<TableCell align="right">
				<AmountText
					text={`${formatADXPretty(stakingEvent.amount)} ${"ADX-LOYALTY"}`}
					fontSize={17}
				/>
			</TableCell>
			<TableCell align="right">
				{formatDateTime(new Date(stakingEvent.timestamp))}
			</TableCell>
			<TableCell align="right">{stakingEvent.blockNumber}</TableCell>
			<TableCell align="right">
				{stakingEvent.type === STAKING_POOL_EVENT_TYPES.leave &&
					stakingEvent.withdrawTxHash && (
						<Box>
							<Typography component="div" variant="caption">
								{t("staking.alreadyWithdrawn")}
							</Typography>
							<ExternalAnchor
								color="inherit"
								id={`withdraw-event-sV5-${stakingEvent.withdrawTxHash}`}
								target="_blank"
								href={`https://etherscan.io/tx/${stakingEvent.withdrawTxHash}`}
							>
								{t("common.seeOnEtherscan")}
							</ExternalAnchor>
						</Box>
					)}
				{stakingEvent.type === STAKING_POOL_EVENT_TYPES.leave &&
					!stakingEvent.withdrawTxHash && (
						<Box m={1}>
							<Tooltip title={disableWithdrawMsg}>
								<Box display="inline-block">
									<Button
										id={`btn-staking-v5-withdraw-${stakingEvent.transactionHash}`}
										variant="contained"
										color="primary"
										onClick={() => {
											setWithdrawEvent(stakingEvent)
											setWithdrawOpen(true)
										}}
										disabled={!!disableWithdrawMsg}
									>
										{t("common.withdraw")}
									</Button>
								</Box>
							</Tooltip>
						</Box>
					)}
			</TableCell>
		</TableRow>
	)
}

export default function Deposits() {
	const { t } = useTranslation()
	const { stats, chosenWalletType } = useContext(AppContext)
	const { tomStakingV5PoolStats } = stats
	const { stakings, loaded } = tomStakingV5PoolStats
	const [withdrawOpen, setWithdrawOpen] = useState(false)
	const [withdrawEvent, setWithdrawEvent] = useState(false)

	const disableDepositsMsg = !chosenWalletType.name
		? t("common.connectWallet")
		: !loaded
		? t("common.loadingData")
		: ""

	const disableWithdrawMsg = !chosenWalletType.name
		? t("common.connectWallet")
		: !loaded
		? t("common.loadingData")
		: ""

	return (
		<Box>
			<Box>
				<Box display="inline-block" m={0.5}>
					<DepositsDialog
						id="staking-pool-v5-deposit-form"
						title={t("common.addNewDeposit")}
						btnLabel={t("common.deposit")}
						color="secondary"
						size="small"
						variant="contained"
						disabled={!!disableDepositsMsg}
						tooltipTitle={disableDepositsMsg}
						depositPool={DEPOSIT_POOLS[1].id}
					/>
				</Box>
			</Box>
			<Box>
				<TableContainer xs={12}>
					<Table aria-label="Bonds table">
						<TableHead>
							<TableRow>
								<TableCell>{t("common.pool")}</TableCell>
								<TableCell align="right">{t("common.type")}</TableCell>
								<TableCell align="right">{t("common.amount")}</TableCell>
								<TableCell align="right">{t("common.timestamp")}</TableCell>
								<TableCell align="right">{t("common.blockNumber")}</TableCell>
								<TableCell align="right">{t("common.actions")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{[...(stakings || [])].map((stakingEvent, i) => (
								<StakingEventRow
									key={stakingEvent.blockNumber + i}
									stakingEvent={stakingEvent}
									setWithdrawEvent={setWithdrawEvent}
									disableWithdrawMsg={disableWithdrawMsg}
									setWithdrawOpen={setWithdrawOpen}
								/>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			{ConfirmationDialog({
				isOpen: withdrawOpen,
				onDeny: () => setWithdrawOpen(false),
				onConfirm: () => {
					setWithdrawOpen(false)
					onStakingPoolV5Withdraw(chosenWalletType, withdrawEvent)
				},
				confirmActionName: t("common.withdraw"),
				content: (
					<>
						<Box mb={1}>
							<Typography>
								{t("dialogs.stakingWithdrawConfirmation")}
							</Typography>
						</Box>
						<Box mb={1}>
							{formatADXPretty(withdrawEvent.amount || ZERO)}
							{" ADX"}
						</Box>
					</>
				)
			})}
		</Box>
	)
}
