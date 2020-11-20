import React, { useContext, useEffect, useState } from "react"
import { FarmContext } from "../FarmProvider"
import AppContext from "../AppContext"
import { Box, useMediaQuery, Button } from "@material-ui/core"
import FarmCard from "./FarmCard"
import FarmInfoCard from "./FarmInfoCard"
import SectionHeader from "./SectionHeader"
import { useTranslation, Trans } from "react-i18next"
import { FARM_POOLS, ZERO } from "../helpers/constants"
import ConfirmationDialog from "./ConfirmationDialog"
import { onHarvestAll } from "../actions"
import {
	formatADXPretty
	// formatTokens
} from "../helpers/formatting"

const Farm = () => {
	const { t } = useTranslation()
	const { farmStats, setGetFarmStats } = useContext(FarmContext)
	const { chosenWalletType, wrapDoingTxns } = useContext(AppContext)
	const {
		pollStatsLoaded,
		userStatsLoaded,
		statsByPoolId,
		blockNumber,
		totalRewards
	} = farmStats

	const canStake = !!chosenWalletType.name && userStatsLoaded //&& !!appStats.connectedWalletAddress
	const justifyCenter = useMediaQuery(theme => theme.breakpoints.down("xs"))
	const [harvestOpen, setHarvestOpen] = useState(false)

	useEffect(() => {
		setGetFarmStats(true)
		return () => {
			setGetFarmStats(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onHarvest = async () => {
		await wrapDoingTxns(
			onHarvestAll.bind(null, {
				farmStats,
				chosenWalletType
			})
		)()
	}

	return (
		<Box>
			<SectionHeader
				title={t("common.farm")}
				actions={
					<Button
						id="btn-rewards-page-re-stake"
						variant="contained"
						color="secondary"
						onClick={() => setHarvestOpen(true)}
						disabled={!userStatsLoaded || !totalRewards}
					>
						{t("farm.harvest")}
					</Button>
				}
			/>
			<Box mt={2}>
				<Box
					display="flex"
					flex={1}
					flexDirection="row"
					flexWrap="wrap"
					alignItems="stretch"
					justifyContent={justifyCenter ? "center" : "flex-start"}
				>
					<FarmInfoCard />
					{FARM_POOLS.map(pool => {
						const stats = statsByPoolId ? statsByPoolId[pool.poolId] : {}

						return (
							<FarmCard
								key={pool.token}
								blockNumber={blockNumber}
								loading={!pollStatsLoaded}
								pollStatsLoaded={pollStatsLoaded}
								userStatsLoaded={userStatsLoaded}
								disabled={!canStake}
								disabledInfo={t("common.connectWallet")}
								pool={pool}
								stats={stats}
							/>
						)
					})}
				</Box>
			</Box>
			{ConfirmationDialog({
				isOpen: harvestOpen,
				onDeny: () => setHarvestOpen(false),
				onConfirm: () => {
					setHarvestOpen(false)
					onHarvest()
				},
				confirmActionName: t("common.harvest"),
				content: (
					<Trans
						i18nKey="dialogs.harvestAllConfirmation"
						values={{
							amount: formatADXPretty(totalRewards || ZERO),
							currency: "ADX"
						}}
						components={{
							box: <Box mb={2}></Box>
						}}
					/>
				)
			})}
		</Box>
	)
}

export default Farm
