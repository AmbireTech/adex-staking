import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { FarmContext } from "../FarmProvider"
import AppContext from "../AppContext"
import {
	Box,
	useMediaQuery,
	Button,
	FormHelperText,
	SvgIcon
} from "@material-ui/core"
import FarmCard from "./FarmCard"
import FarmInfoCard from "./FarmInfoCard"
import SectionHeader from "./SectionHeader"
import { useTranslation, Trans } from "react-i18next"
import { FARM_POOLS, ZERO } from "../helpers/constants"
import ConfirmationDialog from "./ConfirmationDialog"
import { ReactComponent as HarvestIcon } from "./../resources/wheat-icon.svg"
import { onHarvestAll } from "../actions"
import {
	formatADXPretty
	// formatTokens
} from "../helpers/formatting"

const useStyles = makeStyles(theme => {
	return {
		harvestBtn: {},
		harvestIcon: {
			color: ({ canHarvest }) =>
				canHarvest ? theme.palette.special.main : "inherit"
		}
	}
})

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
	const canHarvest = userStatsLoaded && !!totalRewards //&& totalRewards.gt(ZERO)
	const classes = useStyles({ canHarvest })

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
					<Box>
						<Box>
							<Button
								fullWidth
								id="btn-farm-harvest-all-rewards"
								variant="contained"
								color="primary"
								onClick={() => setHarvestOpen(true)}
								disabled={!canHarvest}
								startIcon={
									<SvgIcon fontSize="inherit" className={classes.harvestIcon}>
										<HarvestIcon width="100%" height="100%" />
									</SvgIcon>
								}
							>
								{t("farm.harvest")}
							</Button>
						</Box>
						<Box>
							<FormHelperText>
								{canHarvest
									? `${formatADXPretty(totalRewards || ZERO)} ADX`
									: null}
							</FormHelperText>
						</Box>
					</Box>
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
				confirmActionName: t("farm.harvest"),
				content: (
					<Trans
						i18nKey="dialogs.harvestAllConfirmation"
						values={{
							amount: formatADXPretty(totalRewards || ZERO),
							currency: "ADX"
						}}
					/>
				)
			})}
		</Box>
	)
}

export default Farm
