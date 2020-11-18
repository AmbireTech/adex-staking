import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, LinearProgress, Typography, SvgIcon } from "@material-ui/core"
import { SwapHorizSharp as AssetsLinkIcon } from "@material-ui/icons"
import { CardRow } from "./cardCommon"
import { useTranslation, Trans } from "react-i18next"
import { ExternalAnchor } from "./Anchor"
import {
	toIdAttributeString,
	formatADXPretty,
	getUSDFormatted
} from "../helpers/formatting"
import WithDialog from "./WithDialog"
import FarmForm from "./FarmForm"

const FarmFormDialog = WithDialog(FarmForm)

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "35px",
			position: "absolute",
			width: 189,
			height: 69,
			top: -35,
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
			// boxShadow: theme.type === "light" ? theme.shadows[25] : "none",
			boxShadow: theme.shadows[25],
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-around",
			paddingLeft: 69 + theme.spacing(1),
			paddingRight: theme.spacing(1)
		},
		platformIconBox: {
			color: theme.palette.common.white,
			backgroundColor: theme.palette.common.black,
			width: 71,
			height: 71,
			borderTopLeftRadius: "100%",
			borderBottomLeftRadius: "100%",
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			position: "absolute",
			left: -1,
			top: -1
		},
		overlay: {
			position: "absolute",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: theme.palette.overlay
		},
		loading: {
			position: "absolute",
			width: "100%",
			height: "100%",
			borderRadius: "35px",
			top: 0,
			left: 0,
			opacity: 0.69
		},
		comingSoon: {
			width: 160,
			height: "auto"
		},
		iconSpecial: {
			position: "absolute",
			width: 69,
			height: 69,
			top: -theme.spacing(3),
			color: theme.palette.special.maxWidth
		},
		getLink: {
			marginLeft: theme.spacing(1)
		},
		strong: {
			marginRight: theme.spacing(1)
		}
	}
})

export default function FarmCard({
	loading,
	disabled,
	disabledInfo,
	pollStatsLoaded,
	userStatsLoaded,
	pool,
	stats
}) {
	const { t } = useTranslation()
	const classes = useStyles()

	const {
		id,
		name,
		platform,
		depositAssetName,
		getDepositAssetUrl,
		rewardAssetName
	} = pool

	const platformIcon = (
		<SvgIcon fontSize="large" color="inherit">
			<pool.platformIcon width="99%" height="99%" />
		</SvgIcon>
	)

	const assetsIcons = [
		pool.assetsIcons.map((Icon, i) => (
			<SvgIcon key={i} fontSize="large" color="inherit">
				<Icon width="99%" height="99%" />
			</SvgIcon>
		))
	]

	// const totalDepositTokenBalance =
	// 	pollStatsLoaded
	// 		? `${formatADXPretty(stats.totalSupply)} ${pool.depositAssetName
	// 		}`
	// 		: t("farm.NA")

	const totalDepositTokenStaked = pollStatsLoaded
		? `${formatADXPretty(stats.totalStaked)} ${pool.depositAssetName}`
		: t("farm.NA")

	const totalDepositTokenStakedUSD = pollStatsLoaded
		? `${getUSDFormatted(stats.lpTokenStakedValueUSD)}`
		: t("farm.NA")

	const userStakedShare = userStatsLoaded
		? `${(stats.useShare * 100).toFixed(4)} %`
		: t("farm.NA")

	// const poolMPY = pollStatsLoaded ? stats.poolMPY * 100 : null

	// const currentMPY =
	// 	pollStatsLoaded && poolMPY ? `${poolMPY.toFixed(2)} %` : t("farm.NA")

	// const mpyInfo =
	// 	[
	// 		t("pools.currentDailyYield", {
	// 			yield: pollStatsLoaded
	// 				? (poolMPY / 30).toFixed(4) + " %"
	// 				: t("farm.NA")
	// 		})
	// 	]

	// const poolAPY = pollStatsLoaded ? stats.poolAPY * 100 : null
	// const currentAPY =
	// 	pollStatsLoaded ? `${poolAPY.toFixed(4)} %` : t("farm.NA")

	// const weeklyYield =
	// 	pollStatsLoaded
	// 		? `${(poolAPY / (365 / 7)).toFixed(4)} %`
	// 		: t("farm.NA")

	// const weeklyYieldInfo =
	// 	[
	// 		t("pools.currentDailyYield", {
	// 			yield: pollStatsLoaded
	// 				? (poolAPY / 365).toFixed(4)
	// 				: t("farm.NA")
	// 		})
	// 	]

	const liquidityInfoText = t("farm.liquidityInfo")
	const liquidityStaked = userStatsLoaded
		? `${formatADXPretty(stats.userLPBalance)} ${pool.token}`
		: t("farm.NA")

	const liquidityOnWallet = userStatsLoaded
		? `${formatADXPretty(stats.walletBalance)} ${pool.token}`
		: t("farm.NA")

	const pendingADX = userStatsLoaded
		? `${formatADXPretty(stats.pendingADX)} ADX`
		: t("farm.NA")

	return (
		<Box
			bgcolor={"background.card"}
			p={3}
			my={4}
			mx={2}
			pt={7}
			width={320}
			maxWidth="100%"
			minHeight={420}
			display="flex"
			flexDirection="column"
			alignItems="center"
			boxShadow={25}
			position="relative"
		>
			<Box mb={3}>
				<Typography align="center" variant="h5" color="textPrimary">
					{name}
				</Typography>
			</Box>

			<Box width={1}>
				<CardRow
					color="text.primary"
					fontWeight={"fontWeightRegular"}
					fontSize={16}
					text={
						<Trans
							i18nKey="farm.platform"
							values={{ platform }}
							components={{
								strong: <strong className={classes.strong}></strong>
							}}
						/>
					}
				/>
				<CardRow
					color="text.primary"
					fontWeight={"fontWeightRegular"}
					fontSize={16}
					text={
						<Trans
							i18nKey="farm.depositAsset"
							values={{ depositAsset: depositAssetName }}
							components={{
								strong: <strong className={classes.strong}></strong>,
								getLink: (
									<ExternalAnchor
										color="secondary"
										id={toIdAttributeString(
											`get-liquidity-deposit-${depositAssetName}`
										)}
										target="_blank"
										href={getDepositAssetUrl}
										className={classes.getLink}
									></ExternalAnchor>
								)
							}}
						/>
					}
				/>
				<CardRow
					color="text.primary"
					fontWeight={"fontWeightRegular"}
					fontSize={16}
					text={
						<Trans
							i18nKey="farm.rewardAsset"
							values={{ rewardAsset: rewardAssetName }}
							components={{
								strong: <strong className={classes.strong}></strong>
							}}
						/>
					}
					mb={3}
				/>

				{/* <CardRow
							color="text.main"
							fontWeight={"fontWeightRegular"}
							fontSize={14}
							text={
								<Trans
									i18nKey="farm.currentMPYLabel"
									values={{ mpy: currentMPY }}
									components={{
										strong: (
											<Box
												ml={1}
												display="inline"
												color="special.main"
												fontWeight={"fontWeightBold"}
												fontSize={20}
											/>
										)
									}}
								/>
							}
							infoText={mpyInfo}
							mb={3}
						/> */}

				<CardRow
					color="special.main"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={
						<Trans
							i18nKey="farm.farmStartsInfo"
							components={{
								externalLink: (
									<ExternalAnchor
										className={classes.getLink}
										color="secondary"
										id={`farm-starts-info-link-pool=${id}`}
										target="_blank"
										href={`https://etherscan.io/block/countdown/11296000`}
									/>
								)
							}}
						/>
					}
					mb={3}
				/>

				{/* <CardRow
						color="text.primary"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={t("pools.weeklyYield", { yield: weeklyYield })}
						infoText={weeklyYieldInfo}
						mb={3}
					/> */}

				{/* <CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("farm.totalDepositTokenBalance", { depositAssetName })}
					/>
					<CardRow
						color="text.primary"
						fontWeight={"text.primary"}
						fontSize={14}
						text={totalDepositTokenBalance}
						isAmountText
						mb={0.5}
					/> */}
				<CardRow
					color="text.main"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={t("farm.totalDepositTokenStaked", { depositAssetName })}
				/>
				<CardRow
					color="special.main"
					fontWeight={"text.primary"}
					fontSize={14}
					text={totalDepositTokenStaked}
					isAmountText
				/>
				<CardRow
					color="text.primary"
					fontWeight={"text.primary"}
					fontSize={14}
					text={totalDepositTokenStakedUSD}
					isAmountText
					mb={0.5}
				/>
				<CardRow
					color="text.main"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={t("farm.userStakedShare", { depositAssetName })}
				/>
				<CardRow
					color="text.primary"
					fontWeight={"text.primary"}
					fontSize={14}
					text={userStakedShare}
					mb={3}
				/>

				<CardRow
					color="text.main"
					fontWeight={"fontWeightRegular"}
					fontSize={20}
					text={t("farm.myLiquidity")}
					infoText={liquidityInfoText}
				/>

				<CardRow
					color="text.primary"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={t("farm.myStaked")}
				/>
				<CardRow
					color="special.main"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={liquidityStaked}
					mb={0.5}
				/>
				<CardRow
					color="text.primary"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={t("farm.onWallet")}
				/>
				<CardRow
					color="special.main"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={liquidityOnWallet}
				/>
				<CardRow
					color="text.primary"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={t("farm.myReward")}
				/>
				<CardRow
					color="special.main"
					fontWeight={"fontWeightRegular"}
					fontSize={14}
					text={pendingADX}
					mb={3}
				/>

				<Box mb={1}>
					<FarmFormDialog
						id={`deposit-liquidity-pool-${id}`}
						title={t("common.addNewDeposit")}
						btnLabel={t("common.deposit")}
						fullWidth
						variant="contained"
						disableElevation
						color="secondary"
						size="large"
						tooltipTitle={disabled ? disabledInfo : ""}
						disabled={disabled}
						pool={pool}
						stats={stats}
					/>
				</Box>
				<Box>
					<FarmFormDialog
						id={`withdraw-liquidity-pool-${id}`}
						title={t("common.withdraw")}
						btnLabel={t("common.withdraw")}
						fullWidth
						variant="contained"
						disableElevation
						color="default"
						size="large"
						tooltipTitle={disabled ? disabledInfo : ""}
						disabled={disabled}
						withdraw
						pool={pool}
						stats={stats}
					/>
				</Box>
			</Box>

			{!!loading && (
				<Box
					classes={{ root: classes.overlay }}
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
				></Box>
			)}

			<Box classes={{ root: classes.iconBox }}>
				<Box classes={{ root: classes.platformIconBox }}>
					{platformIcon || null}
				</Box>
				{(assetsIcons || []).reduce((prev, curr) => [
					prev,
					<AssetsLinkIcon />,
					curr
				])}
				{!!loading && (
					<>
						<LinearProgress
							classes={{ root: classes.loading }}
							color="secondary"
						/>
					</>
				)}
			</Box>
		</Box>
	)
}
