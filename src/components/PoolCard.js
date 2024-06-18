import React, { Fragment } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	CircularProgress,
	Typography,
	SvgIcon
} from "@material-ui/core"
import { ReactComponent as ComingSoonImg } from "./../resources/coming-soon-ic.svg"
import { CardRow } from "./cardCommon"
import Tooltip from "./Tooltip"
import WithRouterLink from "./WithRouterLink"
import { ReactComponent as StatsIcon } from "./../resources/stats-ic.svg"
import { useTranslation } from "react-i18next"

const ButtonWithLink = WithRouterLink(Button)

const useStyles = makeStyles(theme => {
	return {
		iconBox: {
			borderRadius: "100%",
			position: "absolute",
			width: 69,
			height: 69,
			top: -theme.spacing(3),
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
			boxShadow: theme.type === "light" ? theme.shadows[25] : 0,
			display: "flex",
			flexDirection: "column",
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
			color: theme.palette.secondary.main,
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0
		},
		comingSoon: {
			width: 160,
			height: "auto"
		}
	}
})

export default function PoolCard({
	id,
	icon,
	name,
	totalStakedADX,
	totalStakedUSD,
	currentAPY,
	weeklyYield,
	weeklyYieldInfo,
	onStakeBtnClick,
	loading,
	disabled,
	disabledInfo,
	lockupPeriodTitle,
	lockupPeriodInfo,
	lockupPeriod,
	loaded,
	actions,
	comingSoon,
	actionBtn,
	extraData = [],
	statsPath
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
			width={270}
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
						color="text.main"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={t("common.totalStaked")}
						// infoText={t('common.totalStaked')}
						justify="center"
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightBold"}
						fontSize={20}
						text={totalStakedADX}
						isAmountText
						// infoText={totalStakedADX}
						justify="center"
					/>

					<CardRow
						color="special.contrastText"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={totalStakedUSD}
						isAmountText
						// infoText={totalStakedADX}
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
						color="text.main"
						fontWeight={"fontWeightBold"}
						fontSize={20}
						text={currentAPY}
						isAmountText
						// infoText={currentAPY}
						justify="center"
					/>

					<CardRow
						color="text.secondaryLight"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={t("pools.weeklyYield", { yield: weeklyYield })}
						infoText={weeklyYieldInfo}
						justify="center"
						mb={3}
					/>

					<CardRow
						color="text.secondaryLight"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={lockupPeriodTitle}
						infoText={lockupPeriodInfo}
						// infoText={"Current annual yield (APY)"}
						justify="center"
					/>

					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={lockupPeriod}
						// infoText={"Current annual yield (APY)"}
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

					{!!statsPath && (
						<Box mb={2}>
							<ButtonWithLink
								fullWidth
								color="default"
								to={statsPath}
								startIcon={
									<SvgIcon fontSize="inherit" color="inherit">
										<StatsIcon width="100%" height="100%" />
									</SvgIcon>
								}
							>
								{t("common.poolStats")}
							</ButtonWithLink>
						</Box>
					)}

					<Tooltip title={disabled ? disabledInfo : ""}>
						<div>
							{actionBtn || (
								<Button
									id={`stake-pool-${id}`}
									fullWidth
									variant="contained"
									disableElevation
									color="secondary"
									size="large"
									onClick={onStakeBtnClick}
									disabled={disabled}
								>
									{t("common.stake")}
								</Button>
							)}
						</div>
					</Tooltip>
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
				{icon || null}
				{!!loading && (
					<CircularProgress classes={{ root: classes.loading }} size={69} />
				)}
			</Box>
		</Box>
	)
}
