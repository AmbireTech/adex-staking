import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	Button,
	CircularProgress,
	Typography,
	SvgIcon,
	Input,
	FormGroup,
	Checkbox,
	FormControlLabel,
	TextField,
} from "@material-ui/core"
import { ReactComponent as ComingSoonImg } from "./../resources/coming-soon-ic.svg"
import { CardRow } from "./cardCommon"
import Tooltip from "./Tooltip"
import { ReactComponent as EmailAwardsIcon } from "./../resources/mail-awards.svg"

const useStyles = makeStyles((theme) => {
	return {
		iconBox: (props) => ({
			borderRadius: "100%",
			position: "absolute",
			width: props.iconSize || 160,
			height: props.iconSize || 160,
			top: -theme.spacing(4),
			backgroundColor: "transparent",
			color: theme.palette.background.default,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
		}),
		overlay: {
			position: "absolute",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: theme.palette.overlay,
		},
		loading: {
			position: "absolute",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
		},
		comingSoon: {
			width: 160,
			height: "auto",
		},
		bold: {
			fontWeight: 800,
		},
		singUp: {
			backgroundColor: theme.palette.text.main,
			borderRadius: 20,
		},
	}
})

export default function EmailSignUp({
	poolId,
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
	iconBg,
	iconSize,
	comingSoon,
}) {
	const classes = useStyles({ iconBg, iconSize })

	return (
		<Box
			bgcolor={"background.paper"}
			p={3}
			my={3}
			mx={1.5}
			pt={15}
			width={270}
			maxWidth="100%"
			minHeight={420}
			display="flex"
			flexDirection="column"
			alignItems="center"
			boxShadow={25}
			position="relative"
		>
			<CardRow
				mt={3}
				color="white"
				fontWeight={"fontWeightBold"}
				fontSize={16}
				text={"Subscribe for AdEx News &"}
				justify="center"
			/>
			<Box color="warning.main" fontWeight={"fontWeightBold"}>
				<Typography component="span" variant="h6">
					win
					<Typography className={classes.bold} component="span" variant="h5">
						{` 5x1000 `}
					</Typography>
					ADX!
				</Typography>{" "}
			</Box>
			<Box width={1} mt={3}>
				<TextField
					id="standard-helperText"
					label="Email"
					variant="filled"
					color="secondary"
					fullWidth
				/>
			</Box>
			<Box>
				<FormControlLabel
					control={
						<Checkbox
							// checked={state.checkedA}
							// onChange={handleChange}
							name="checkedA"
						/>
					}
					label="Secondary"
				/>
			</Box>
			<Box width={1} mt={3} display="flex" justifyContent="center">
				<Button id={`sign-up`} className={classes.singUp} variant="contained">
					{"Sure, I'm in"}
				</Button>
			</Box>

			{/* <Box mb={3}>
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
						text={"Total Staked"}
						infoText={"Total Staked"}
						justify="center"
					/>

					<CardRow
						color="warning.main"
						fontWeight={"fontWeightBold"}
						fontSize={20}
						text={totalStakedADX}
						isAmountText
						// infoText={totalStakedADX}
						justify="center"
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={totalStakedUSD}
						isAmountText
						// infoText={totalStakedADX}
						justify="center"
						mb={3}
					/>

					<CardRow
						color="text.primary"
						fontWeight={"fontWeightRegular"}
						fontSize={14}
						text={"Current annual yield (APY)"}
						// infoText={"Current annual yield (APY)"}
						justify="center"
					/>

					<CardRow
						color="warning.main"
						fontWeight={"fontWeightBold"}
						fontSize={20}
						text={currentAPY}
						isAmountText
						// infoText={currentAPY}
						justify="center"
					/>

					<CardRow
						color="text.main"
						fontWeight={"fontWeightBold"}
						fontSize={14}
						text={`Weekly yield ${weeklyYield}`}
						infoText={weeklyYieldInfo}
						justify="center"
						mb={3}
					/>

					<CardRow
						color="text.main"
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

					<Tooltip
						disableFocusListener={!disabled}
						disableHoverListener={!disabled}
						disableTouchListener={!disabled}
						title={disabled ? disabledInfo : ""}
					>
						<div>
							<Button
								id={`stake-pool-${poolId}`}
								fullWidth
								variant="contained"
								disableElevation
								color="secondary"
								onClick={onStakeBtnClick}
								disabled={disabled}
							>
								{"Stake"}
							</Button>
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
					<CircularProgress
						classes={{ root: classes.loading }}
						size={69}
						color="secondary"
					/>
				)}
			</Box>
			*/}
			<Box classes={{ root: classes.iconBox }}>
				<EmailAwardsIcon />
			</Box>
		</Box>
	)
}
