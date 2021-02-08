import React, { useContext } from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { formatADXPretty, formatDateTime } from "../helpers/formatting"
import AppContext from "../AppContext"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import { AmountText } from "./cardCommon"
import { useTranslation } from "react-i18next"
import { POOLS } from "../helpers/constants"

const DepositsDialog = WithDialog(DepositForm)

export default function Deposits() {
	const { t } = useTranslation()
	const { stats, chosenWalletType } = useContext(AppContext)
	const { tomStakingV5PoolStats } = stats
	const { stakings, loaded } = tomStakingV5PoolStats

	const disableDepositsMsg = !chosenWalletType.name
		? t("common.connectWallet")
		: !loaded
		? t("common.loadingData")
		: ""

	const renderStakingEventRow = stakingEvent => {
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
			</TableRow>
		)
	}

	return (
		<Box>
			<Box>
				<Box display="inline-block" m={0.5}>
					<DepositsDialog
						id="loyalty-pool-deposit-form"
						title={t("common.addNewDeposit")}
						btnLabel={t("common.deposit")}
						color="secondary"
						size="small"
						variant="contained"
						disabled={!!disableDepositsMsg}
						tooltipTitle={disableDepositsMsg}
						depositPool={POOLS[2]}
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
							</TableRow>
						</TableHead>
						<TableBody>
							{[...(stakings || [])].map(renderStakingEventRow)}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	)
}
