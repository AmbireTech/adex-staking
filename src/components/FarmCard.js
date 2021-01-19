import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, LinearProgress, Typography, SvgIcon } from "@material-ui/core"
import { SwapHorizSharp as AssetsLinkIcon } from "@material-ui/icons"
import { ReactComponent as SpecialIcon } from "./../resources/crown-ic.svg"
import { CardRow } from "./cardCommon"
import { useTranslation, Trans } from "react-i18next"
import { ExternalAnchor } from "./Anchor"
import {
	toIdAttributeString,
	formatADXPretty,
	getUSDFormatted,
	formatLPToken
	// formatTokens
} from "../helpers/formatting"
import WithDialog from "./WithDialog"
import FarmForm from "./FarmForm"

const FarmFormDialog = WithDialog(FarmForm)
// const REWARDS_ACTIVE_FROM_BLOCK = 11296000

const useStyles = makeStyles(theme => {
	const iconBoxBorder = ({ special }) =>
		special ? `3px solid ${theme.palette.special.main}` : "none"

	return {
		iconBox: {
			borderRadius: "35px",
			position: "absolute",
			width: 189,
			height: 69,
			top: -35,
			background: `linear-gradient(90deg, ${theme.palette.common.black} 69px, ${theme.palette.common.white} 69px)`,
			color: theme.palette.common.black,
			// boxShadow: theme.type === "light" ? theme.shadows[25] : "none",
			boxShadow: theme.shadows[25],
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-around",
			paddingLeft: 69 + theme.spacing(1),
			paddingRight: theme.spacing(1),
			border: iconBoxBorder
		},
		platformIconBox: {
			color: theme.palette.common.white,
			width: 69,
			height: "100%",
			borderTopLeftRadius: "100%",
			borderBottomLeftRadius: "100%",
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			position: "absolute",
			left: 0,
			top: 0
		},
		specialIcon: {
			position: "absolute",
			width: 42,
			height: 42,
			left: -18,
			top: -23,
			transform: `rotate(320deg)`,
			color: theme.palette.special.main
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

export const FarmPoolData = ({
	pollStatsLoaded,
	userStatsLoaded,
	pool,
	stats,
	blockNumber
}) => {
	const { t } = useTranslation()
	const classes = useStyles()

	const {
		platform,
		depositAssetName,
		getDepositAssetUrl,
		rewardAssetName
	} = pool

	const {
		lpTokenStakedValueUSD,
		lpTokenDataWithPrices,
		useShare,
		walletBalance,
		userLPBalance
	} = stats

	// const totalDepositTokenBalance =
	// 	pollStatsLoaded
	// 		? `${formatADXPretty(stats.totalSupply)} ${pool.depositAssetName
	// 		}`
	// 		: t("farm.NA")

	const totalDepositTokenStaked = pollStatsLoaded
		? `${formatADXPretty(stats.totalStaked)} ${pool.depositAssetName}`
		: t("farm.NA")

	const totalDepositTokenStakedUSD = pollStatsLoaded
		? `${getUSDFormatted(lpTokenStakedValueUSD)}`
		: t("farm.NA")

	const userStakedShare = userStatsLoaded
		? `${(useShare * 100).toFixed(4)} %`
		: t("farm.NA")

	const poolMPY = pollStatsLoaded ? stats.poolMPY * 100 : null

	const currentMPY =
		pollStatsLoaded && poolMPY ? `${poolMPY.toFixed(2)} %` : t("farm.NA")

	const mpyInfo = [
		t("pools.currentDailyYield", {
			yield: pollStatsLoaded ? (poolMPY / 30).toFixed(4) + " %" : t("farm.NA")
		})
	]

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
	const liquidityStakedLP = userStatsLoaded
		? `${formatADXPretty(userLPBalance)} ${depositAssetName}`
		: t("farm.NA")

	const liquidityStakedLPInfo =
		userStatsLoaded && !userLPBalance.isZero()
			? ` (${formatLPToken({
					lpValueBN: userLPBalance,
					lpTokenDataWithPrices,
					lpTokenName: depositAssetName
			  })})`
			: ""

	const liquidityOnWalletLP = userStatsLoaded
		? `${formatADXPretty(walletBalance)} ${depositAssetName}`
		: t("farm.NA")

	const liquidityOnWalletLPInfo =
		userStatsLoaded && !walletBalance.isZero()
			? ` (${formatLPToken({
					lpValueBN: walletBalance,
					lpTokenDataWithPrices,
					lpTokenName: depositAssetName
			  })})`
			: ""

	const pendingADX = userStatsLoaded
		? `${formatADXPretty(stats.pendingADX)} ADX`
		: t("farm.NA")

	return (
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
				mb={2}
			/>

			{/* {blockNumber && blockNumber >= REWARDS_ACTIVE_FROM_BLOCK ? ( */}
			<CardRow
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
				mb={2}
			/>
			{/* ) : (
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
					mb={2}
				/>
			)} */}

			{/* <CardRow
						color="text.primary"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={t("pools.weeklyYield", { yield: weeklyYield })}
						infoText={weeklyYieldInfo}
						mb={2}
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
				text={t("farm.totalDepositTokenStaked", {
					depositAsset: depositAssetName
				})}
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
				text={t("farm.userStakedShare")}
			/>
			<CardRow
				color="text.primary"
				fontWeight={"text.primary"}
				fontSize={14}
				text={userStakedShare}
				mb={2}
			/>

			<CardRow
				color="text.main"
				fontWeight={"fontWeightRegular"}
				fontSize={20}
				text={t("farm.myLiquidity")}
				infoText={liquidityInfoText}
				mb={0.5}
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
				text={
					<Box>
						<Box>{liquidityStakedLP}</Box>
						{liquidityStakedLPInfo && (
							<Box color="text.primary">{liquidityStakedLPInfo}</Box>
						)}
					</Box>
				}
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
				text={
					<Box>
						<Box>{liquidityOnWalletLP}</Box>
						{liquidityStakedLPInfo && (
							<Box color="text.primary">{liquidityOnWalletLPInfo}</Box>
						)}
					</Box>
				}
				mb={0.5}
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
				mb={2}
			/>
		</Box>
	)
}

export default function FarmCard({
	loading,
	disabled,
	disabledInfo,
	pollStatsLoaded,
	userStatsLoaded,
	pool,
	stats,
	blockNumber
}) {
	const { t } = useTranslation()
	const { id, name, special, latRewardBlock } = pool
	const classes = useStyles({ special })

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

	const canDeposit = blockNumber < latRewardBlock

	return (
		<Box
			bgcolor={"background.card"}
			p={3}
			my={4}
			mx={2}
			pt={6}
			width={320}
			maxWidth="100%"
			minHeight={420}
			display="flex"
			flexDirection="column"
			alignItems="center"
			boxShadow={25}
			position="relative"
		>
			<Box mb={2}>
				<Typography align="center" variant="h5" color="textPrimary">
					{name}
				</Typography>
			</Box>

			<FarmPoolData
				pollStatsLoaded={pollStatsLoaded}
				userStatsLoaded={userStatsLoaded}
				pool={pool}
				stats={stats}
				blockNumber={blockNumber}
			/>

			<Box width={1}>
				<Box mb={1}>
					<FarmFormDialog
						id={`deposit-liquidity-pool-${id}`}
						title={t("farm.depositDialogTitle", { name })}
						btnLabel={t("common.deposit")}
						fullWidth
						variant="contained"
						disableElevation
						color="secondary"
						size="large"
						tooltipTitle={
							disabled ? disabledInfo : !canDeposit ? t("farm.farmEnded") : ""
						}
						disabled={disabled || !canDeposit}
						pool={pool}
						stats={stats}
						blockNumber={blockNumber}
					/>
				</Box>
				<Box>
					<FarmFormDialog
						id={`withdraw-liquidity-pool-${id}`}
						title={t("farm.withdrawDialogTitle", { name })}
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
						blockNumber={blockNumber}
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
				{!!special && (
					<SvgIcon fontSize="large" className={classes.specialIcon}>
						<SpecialIcon width="99%" height="99%" />
					</SvgIcon>
				)}
			</Box>
		</Box>
	)
}
