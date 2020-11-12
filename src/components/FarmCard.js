import React, { Fragment } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	LinearProgress,
	Typography,
	SvgIcon
} from "@material-ui/core"
import { SwapHorizSharp as AssetsLinkIcon } from "@material-ui/icons"
import { ReactComponent as ComingSoonImg } from "./../resources/coming-soon-ic.svg"
import { CardRow } from "./cardCommon"
import Tooltip from "./Tooltip"
import { useTranslation, Trans } from "react-i18next"
import { ExternalAnchor } from "./Anchor"
import { toIdAttributeString } from "../helpers/formatting"

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "35px",
			position: "absolute",
			width: 189,
			height: 69,
			top: -theme.spacing(3),
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
		}
	}
})

export default function FarmCard({
	id,
	platformIcon,
	assetsIcons,
	name,
	totalDepositTokenBalance,
	totalDepositTokenStaked,
	getDepositAssetsUrl,
	userStakedShare,
	currentAPY,
	weeklyYield,
	weeklyYieldInfo,
	onDepositBtnClick,
	onWithdrawBtnClick,
	loading,
	disabled,
	disabledInfo,
	liquidityInfoText,
	liquidityStaked,
	liquidityOnWallet,
	loaded,
	actions,
	comingSoon,
	actionBtn,
	extraData = [],
	special,
	platform,
	depositAssets,
	rewardAssets
}) {
	const { t } = useTranslation()
	const classes = useStyles()

	return (
		<Box
			bgcolor={"background.card"}
			p={3}
			my={3}
			mx={1}
			pt={7}
			width={420}
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

			{comingSoon ? (
				<Box>
					<SvgIcon className={classes.comingSoon} color="primary">
						<ComingSoonImg width="100%" height="100%" />
					</SvgIcon>
				</Box>
			) : (
				<Box>
					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={16}
						text={t("farm.platform", { platform })}
					/>
					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={16}
						text={
							<Trans
								i18nKey="farm.depositAssets"
								values={{ depositAssets }}
								components={{
									getLink: (
										<ExternalAnchor
											color="secondary"
											id={toIdAttributeString(
												`get-liquidity-deposit-${depositAssets}`
											)}
											target="_blank"
											href={getDepositAssetsUrl}
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
						text={t("farm.rewardAssets", { rewardAssets })}
						mb={3}
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={
							<Trans
								i18nKey="farm.currentAPYLabel"
								values={{ apy: currentAPY }}
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
					/>

					<CardRow
						color="text.primary"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={t("pools.weeklyYield", { yield: weeklyYield })}
						infoText={weeklyYieldInfo}
						mb={3}
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("farm.totalDepositTokenBalance", { depositAssets })}
					/>
					<CardRow
						color="text.primary"
						fontWeight={"text.primary"}
						fontSize={14}
						text={totalDepositTokenBalance}
						isAmountText
						mb={0.5}
					/>
					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("farm.totalDepositTokenStaked", { depositAssets })}
					/>
					<CardRow
						color="text.primary"
						fontWeight={"text.primary"}
						fontSize={14}
						text={totalDepositTokenStaked}
						isAmountText
						mb={0.5}
					/>
					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("farm.userStakedShare", { depositAssets })}
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
						mb={3}
					/>

					{extraData.map(data => (
						<Fragment key={data.id}>
							<CardRow
								color="text.main"
								fontWeight={"fontWeightRegular"}
								fontSize={14}
								text={data.title}
								infoText={data.titleInfo}
								justify="center"
							/>

							{data.importantValue && (
								<CardRow
									color="special.main"
									fontWeight={"fontWeightBold"}
									fontSize={20}
									text={data.importantValue}
									isAmountText
									infoText={data.valueInfo}
									justify="center"
								/>
							)}

							{data.normalValue && (
								<CardRow
									color="text.primary"
									fontWeight={"fontWeightRegular"}
									fontSize={14}
									text={data.normalValue}
									infoText={data.valueInfo}
									justify="center"
									mb={3}
								/>
							)}

							{data.extra && (
								<CardRow
									color="text.primary"
									fontWeight={"fontWeightRegular"}
									fontSize={14}
									text={data.extra}
									infoText={data.extrInfo}
									justify="center"
									mb={3}
								/>
							)}
						</Fragment>
					))}

					<Box m={1}>
						<Tooltip title={disabled ? disabledInfo : ""}>
							<div>
								{actionBtn || (
									<Button
										id={`deposit-liquidity-pool-${id}`}
										fullWidth
										variant="contained"
										disableElevation
										color="secondary"
										size="large"
										onClick={onDepositBtnClick}
										disabled={disabled}
									>
										{t("common.deposit")}
									</Button>
								)}
							</div>
						</Tooltip>
					</Box>
					<Box m={1}>
						<Tooltip title={disabled ? disabledInfo : ""}>
							<div>
								{actionBtn || (
									<Button
										id={`withdraw-liquidity-pool-${id}`}
										fullWidth
										variant="contained"
										disableElevation
										color="default"
										size="large"
										onClick={onWithdrawBtnClick}
										disabled={disabled}
									>
										{t("common.withdraw")}
									</Button>
								)}
							</div>
						</Tooltip>
					</Box>
				</Box>
			)}

			{!!loading && (
				<Box
					classes={{ root: classes.overlay }}
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
				>
					<Typography align="center" component="div" variant="h3"></Typography>
				</Box>
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
