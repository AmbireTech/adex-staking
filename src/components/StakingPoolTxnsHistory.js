import React, { useContext } from "react"
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
	const classes = useStyles()
	const PoolIcon = iconByPoolId({ poolId: "adex-staking-pool" })

	return (
		<TableRow key={stakingEvent.blockNumber + stakingEvent.type}>
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
					<Box>{stakingEvent.label}</Box>
				</Box>
			</TableCell>
			<TableCell align="right">{stakingEvent.type}</TableCell>
			<TableCell align="right">
				<AmountText
					text={`${formatADXPretty(
						stakingEvent.adxAmount || stakingEvent.maxTokens
					)} ${"ADX"}`}
					fontSize={17}
				/>
			</TableCell>
			<TableCell align="right">
				{formatDateTime(new Date(stakingEvent.timestamp))}
			</TableCell>
			<TableCell align="right">
				<ExternalAnchor
					color="inherit"
					id={`staking-v5-tx-block-on-etherscan-${stakingEvent.blockNumber}`}
					target="_blank"
					href={`https://etherscan.io/block/${stakingEvent.blockNumber}`}
				>
					{stakingEvent.blockNumber}
				</ExternalAnchor>
			</TableCell>
			<TableCell align="right">
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
			</TableCell>
		</TableRow>
	)
}

export default function StakingPoolTxnsHistory() {
	const { t } = useTranslation()
	const { stats } = useContext(AppContext)
	const { tomStakingV5PoolStats } = stats
	const { stakings, loaded } = tomStakingV5PoolStats

	return (
		<Box>
			<Box>
				<TableContainer xs={12}>
					<Table aria-label="Bonds table">
						<TableHead>
							<TableRow>
								<TableCell>{t("common.pool")}</TableCell>
								<TableCell align="right">{t("deposits.eventType")}</TableCell>
								<TableCell align="right">{t("deposits.amount")}</TableCell>
								<TableCell align="right">{t("deposits.from")}</TableCell>
								<TableCell align="right">{t("deposits.blockNumber")}</TableCell>
								<TableCell align="right">{t("deposits.txnHash")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{[...(stakings || [])].reverse().map((stakingEvent, i) => (
								<StakingEventRow
									key={stakingEvent.blockNumber + i}
									stakingEvent={stakingEvent}
								/>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	)
}
