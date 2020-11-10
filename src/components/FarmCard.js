import React, { Fragment } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	LinearProgress,
	Typography,
	SvgIcon
} from "@material-ui/core"
import { ReactComponent as ComingSoonImg } from "./../resources/coming-soon-ic.svg"
import { CardRow } from "./cardCommon"
import Tooltip from "./Tooltip"
import { useTranslation } from "react-i18next"

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "35px",
			position: "absolute",
			width: 169,
			height: 69,
			top: -theme.spacing(3),
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
			boxShadow: theme.type === "light" ? theme.shadows[25] : 0,
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center"
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
		}
	}
})

export default function FarmCard({
	id,
	icons,
	name,
	totalDeposits,
	totalStakedUSD,
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
			mx={1.5}
			pt={7}
			width={300}
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
						<ComingSoonImg
							width="100%"
							height="100%"
							// width={160}
						/>
					</SvgIcon>
				</Box>
			) : (
				<Box>
					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={16}
						text={t("farm.platform", { platform })}
						// justify="center"
					/>
					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={16}
						text={t("farm.depositAssets", { depositAssets })}
						// justify="center"
					/>
					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={16}
						text={t("farm.rewardAssets", { rewardAssets })}
						// justify="center"
						mb={3}
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("farm.totalDeposits")}
						// infoText={t('common.totalStaked')}
						justify="center"
					/>

					<CardRow
						color="special.main"
						fontWeight={"text.primary"}
						fontSize={14}
						text={totalDeposits}
						isAmountText
						multilineLinesAmounts
						justify="center"
						mb={3}
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("pools.currentAPYLabel")}
						// infoText={"Current annual yield (APY)"}
						justify="center"
					/>

					<CardRow
						color="special.main"
						fontWeight={"fontWeightBold"}
						fontSize={20}
						text={currentAPY}
						isAmountText
						// infoText={currentAPY}
						justify="center"
					/>

					<CardRow
						color="text.primary"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={t("pools.weeklyYield", { yield: weeklyYield })}
						infoText={weeklyYieldInfo}
						justify="center"
						mb={3}
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("farm.myLiquidity")}
						infoText={liquidityInfoText}
						justify="center"
					/>

					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={liquidityStaked}
						justify="center"
					/>

					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={liquidityOnWallet}
						justify="center"
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
				{icons || null}
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
