import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { TableRow, Box, TableBody, SvgIcon } from "@material-ui/core"
import {
	formatADXPretty,
	formatDateTime,
	formatTxnHash
} from "../helpers/formatting"
import AppContext from "../AppContext"
import { AmountText } from "./cardCommon"
import { useTranslation } from "react-i18next"
import { ExternalAnchor } from "./Anchor"
import { iconByPoolId } from "../helpers/constants"
import { STAKING_POOL_EVENT_TYPES } from "../actions/v5actions"
import CustomTable, { StyledTableCell, StyledTableHead } from "./CustomTable"

const stakingPoolLabel = {
	"adex-loyalty-pool": "common.loPo",
	"adex-staking-pool": "common.tomStakingPool"
}

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
		}
	}
})

const StakingEventRow = ({ stakingEvent }) => {
	const { t } = useTranslation()
	const classes = useStyles()
	const PoolIcon = iconByPoolId({
		poolId: stakingEvent.pool || "adex-staking-pool"
	})
	const isExternalShareTokenTransfer =
		stakingEvent.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferIn ||
		stakingEvent.type === STAKING_POOL_EVENT_TYPES.shareTokensTransferOut

	return (
		<TableRow>
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
					<Box>
						{t(stakingPoolLabel[stakingEvent.pool || "adex-staking-pool"])}
					</Box>
				</Box>
			</StyledTableCell>
			<StyledTableCell align="right">
				{t(`eventTypes.${stakingEvent.type}`)}
			</StyledTableCell>
			<StyledTableCell align="right">
				<AmountText
					text={`${formatADXPretty(
						stakingEvent.adxAmount || stakingEvent.maxTokens
					)} ${"ADX"}`}
					fontSize={17}
				/>
				{isExternalShareTokenTransfer && " *"}
			</StyledTableCell>
			<StyledTableCell align="right">
				{formatDateTime(new Date(stakingEvent.timestamp))}
			</StyledTableCell>
			<StyledTableCell align="right">
				{stakingEvent.type === STAKING_POOL_EVENT_TYPES.enter && "-"}
				{stakingEvent.type === STAKING_POOL_EVENT_TYPES.leave && (
					<Box>
						<Box>
							{t("deposits.unlocksAtInfo", {
								unlocksAt: formatDateTime(
									Math.ceil(stakingEvent.unlocksAt * 1000)
								)
							})}
						</Box>
					</Box>
				)}
				{stakingEvent.type === STAKING_POOL_EVENT_TYPES.rageLeave && (
					<Box>
						<Box>
							{t("deposits.maxTokens", {
								maxTokens: `${formatADXPretty(stakingEvent.maxTokens)}`,
								currency: "ADX"
							})}
						</Box>
						<Box>
							{t("deposits.receivedTokens", {
								receivedTokens: `${formatADXPretty(
									stakingEvent.receivedTokens
								)}`,
								currency: "ADX"
							})}
						</Box>
					</Box>
				)}
				{isExternalShareTokenTransfer && (
					<Box>
						<Box>
							<AmountText
								text={`${formatADXPretty(stakingEvent.shares)} ${"ADX-SHARE"}`}
								fontSize={17}
							/>
						</Box>
						<Box></Box>
					</Box>
				)}
			</StyledTableCell>
			<StyledTableCell align="right">
				{
					<ExternalAnchor
						color="inherit"
						id={`staking-v5-tx-on-etherscan-${stakingEvent.transactionHash}`}
						target="_blank"
						href={`https://etherscan.io/tx/${stakingEvent.transactionHash}`}
					>
						{formatTxnHash(stakingEvent.transactionHash)}
					</ExternalAnchor>
				}
			</StyledTableCell>
		</TableRow>
	)
}

export default function StakingPoolTxnsHistory() {
	const { t } = useTranslation()
	const { stats } = useContext(AppContext)
	const { tomStakingV5PoolStats, loyaltyPoolStats } = stats
	const { stakings: stakingPoolEvents } = tomStakingV5PoolStats
	const { stakingEvents: loyaltyPoolEvents } = loyaltyPoolStats

	const stakings = stakingPoolEvents
		.concat(loyaltyPoolEvents)
		.sort((a, b) => a.blockNumber - b.blockNumber)

	return (
		<Box>
			<Box>
				<CustomTable xs={12}>
					<StyledTableHead>
						<TableRow>
							<StyledTableCell>{t("common.pool")}</StyledTableCell>
							<StyledTableCell align="right">
								{t("deposits.eventType")}
							</StyledTableCell>
							<StyledTableCell align="right">
								{t("deposits.amount")}
							</StyledTableCell>
							<StyledTableCell align="right">
								{t("deposits.from")}
							</StyledTableCell>
							<StyledTableCell align="right">
								{t("deposits.extraInfo")}
							</StyledTableCell>
							<StyledTableCell align="right">
								{t("deposits.txnHash")}
							</StyledTableCell>
						</TableRow>
					</StyledTableHead>
					<TableBody>
						{[...(stakings || [])].reverse().map((stakingEvent, i) => (
							<StakingEventRow
								key={stakingEvent.blockNumber + stakingEvent.type + i}
								stakingEvent={stakingEvent}
							/>
						))}
					</TableBody>
				</CustomTable>
			</Box>
		</Box>
	)
}
