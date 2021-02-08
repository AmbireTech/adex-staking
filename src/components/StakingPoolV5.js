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
import { AmountText } from "./cardCommon"
import { useTranslation } from "react-i18next"

export default function Deposits() {
	const { t } = useTranslation()
	const { stats } = useContext(AppContext)
	const { tomStakingV5PoolStats } = stats
	const { stakings } = tomStakingV5PoolStats

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
