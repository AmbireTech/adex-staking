import React, { useContext } from "react"
import {
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Box,
	SvgIcon,
	CircularProgress,
	alpha
} from "@material-ui/core"
import clsx from "clsx"
import Anchor from "./Anchor"
import logo from "./../resources/adex_staking.svg"
import { makeStyles } from "@material-ui/core/styles"
import { useLocation } from "react-router-dom"
import packageJson from "./../../package.json"
import { ADDR_ADX } from "./../helpers/constants"
import WithRouterLink from "./WithRouterLink"
import UserData from "./UserData"
import MigrationBtn from "./MigrationBtn"
import { HomeSharp as HomeIcon } from "@material-ui/icons"
import { ReactComponent as StakingIcon } from "./../resources/staked-ic.svg"
import { ReactComponent as GiftIcon } from "./../resources/gift-orange-ic.svg"
import { ReactComponent as StatsIcon } from "./../resources/stats-ic.svg"
import { ReactComponent as DashboardIcon } from "./../resources/dashboard-ic.svg"
import { useTranslation } from "react-i18next"
// import { alpha } from "@material-ui/core/styles/colorManipulator"
import { MultiThemeContext } from "../MultiThemeProvider"

const RRListItem = WithRouterLink(ListItem)

const useStyles = makeStyles(theme => {
	const activeColor = theme.palette.sideNav.text.primary
	const activeBgColor = theme.palette.sideNav.background.active

	return {
		sntPadding: {
			paddingTop: 0
		},
		navListRoot: {
			color: theme.palette.sideNav.text.secondary,
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between"
		},
		navList: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 100,
			overflowY: "auto",
			overflowX: "hidden"
		},
		sideNavToolbar: {},
		version: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			padding: 10,
			paddingLeft: 16,
			borderTopWidth: 1,
			borderTopColor: theme.palette.sideNav.divider,
			borderTopStyle: "solid"
		},
		listItem: {
			width: "90%",
			margin: "0 auto",
			borderRadius: "5px",
			color: theme.palette.sideNav.text.primary,
			"& .MuiListItemIcon-root": {
				color: theme.palette.sideNav.text.primary // alpha(theme.palette.text.main, 0.69)
			}
		},
		active: {
			color: activeColor,
			backgroundColor: activeBgColor,
			"&:focus": {
				backgroundColor: activeBgColor
			},
			"&:hover": {
				backgroundColor: activeBgColor,
				color: activeColor,
				"& .MuiListItemIcon-root": {
					color: activeColor
				}
			},
			"& .MuiListItemIcon-root": {
				color: activeColor //theme.palette.text.main
			}
		},
		adxLink: {
			color: theme.palette.sideNav.text.hint,
			"&:hover": {
				color: theme.palette.sideNav.text.secondary
			}
		},
		sideSwitch: {
			marginBottom: `${theme.spacing(2)}px`
		},
		icon: {
			height: 32,
			width: "auto",
			cursor: "pointer"
		},
		amount: {
			fontSize: theme.typography.pxToRem(18)
		},
		overlay: {
			position: "absolute",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "transparent",
			textTransform: "uppercase"
		},
		loading: {
			backgroundColor: alpha(theme.palette.sideNav.background.darkerPaper, 0.2)
		},
		noUserData: {
			opacity: 0.23
		}
	}
})

function SideNav({
	prices,
	stats,
	onRequestUnbond,
	onUnbond,
	onClaimRewards,
	setConnectWallet,
	updatingStats,
	chosenWalletType
}) {
	const { themeType } = useContext(MultiThemeContext)
	const { t } = useTranslation()
	const classes = useStyles()
	const location = useLocation()
	const path = location.pathname
	const contentPadding = 1

	return (
		<Box
			position="relative"
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
			flexGrow="1"
		>
			<Box px={contentPadding}>
				<Box>
					<Box>
						<ListItem>
							<Box
								mb={4}
								mt={2}
								display="flex"
								flexDirection="row"
								alignItems="flex-start"
							>
								<img height="69px" src={logo} alt="adex-staking-logo"></img>
							</Box>
						</ListItem>

						<Box position="relative">
							<ListItem
								className={clsx({
									[classes.noUserData]: !stats.connectedWalletAddress
								})}
							>
								<Box width={1}>
									{UserData({
										prices,
										stats,
										onRequestUnbond,
										onUnbond,
										onClaimRewards
									})}

									{path !== "/stakings" && (
										<Box>
											<MigrationBtn />
										</Box>
									)}
								</Box>
							</ListItem>

							{updatingStats && (
								<Box
									id="side-nav-connect-wallet-overlay-loading"
									className={clsx(classes.overlay, classes.loading)}
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									color="secondary.main"
									fontSize="h1.fontSize"
									textAlign="center"
								>
									<CircularProgress color="" size="100px" />
								</Box>
							)}

							{!chosenWalletType.name && !updatingStats && (
								<Box
									id="side-nav-connect-wallet-overlay"
									className={classes.overlay}
									display="flex"
									flexDirection="column"
									alignItems="center"
									justifyContent="center"
									color="secondary.main"
									fontSize="h1.fontSize"
									textAlign="center"
									onClick={() => setConnectWallet(true)}
									style={{ cursor: "pointer" }}
								>
									{t("common.connectWallet")}
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Box>
			<Box mt={3} mb={4}>
				<Divider />
			</Box>
			<Box
				display="flex"
				flexDirection="column"
				justifyContent="space-between"
				flex="1"
				px={contentPadding}
			>
				<Box>
					<List>
						<RRListItem
							id="side-nav-link-pools"
							button
							to={{ pathname: "/" }}
							className={clsx(classes.listItem, {
								[classes.active]: path === "/"
							})}
						>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText primary={t("common.pools")} />
						</RRListItem>

						<RRListItem
							id="side-nav-link-stakings"
							button
							to={{ pathname: "/stakings" }}
							className={clsx(classes.listItem, {
								[classes.active]: path === "/stakings"
							})}
						>
							<ListItemIcon>
								<SvgIcon>
									<StakingIcon width="100%" height="100%" />
								</SvgIcon>
							</ListItemIcon>
							<ListItemText primary={t("common.staked")} />
						</RRListItem>
						<RRListItem
							id="side-nav-link-rewards"
							button
							to={{ pathname: "/rewards" }}
							className={clsx(classes.listItem, {
								[classes.active]: path === "/rewards"
							})}
						>
							<ListItemIcon color="inherit">
								<SvgIcon color="inherit">
									<GiftIcon width="100%" height="100%" />
								</SvgIcon>
							</ListItemIcon>
							<ListItemText primary={t("common.rewards")} />
						</RRListItem>
						{/* <RRListItem
							id="side-nav-link-farm"
							button
							to={{ pathname: "/farm" }}
							className={clsx(classes.listItem, {
								[classes.active]: path === "/farm"
							})}
						>
							<ListItemIcon color="inherit">
								<SvgIcon color="inherit">
									<FarmIcon width="100%" height="100%" />
								</SvgIcon>
							</ListItemIcon>
							<ListItemText primary={t("common.farm")} />
						</RRListItem> */}
						{/* <RRListItem
							id="side-nav-link-stats"
							button
							to={{ pathname: "/stats" }}
							className={clsx(classes.listItem, {
								[classes.active]: path === "/stats"
							})}
						>
							<ListItemIcon color="inherit">
								<SvgIcon color="inherit">
									<StatsIcon width="100%" height="100%" />
								</SvgIcon>
							</ListItemIcon>
							<ListItemText primary={t("common.validatorStats")} />
						</RRListItem> */}
						{/* <RRListItem
							id="side-nav-link-gasless"
							button
							to={{ pathname: "/gasless" }}
							className={clsx(classes.listItem, {
								[classes.active]: path === "/gasless"
							})}
						>
							<ListItemIcon color="inherit">
								<SvgIcon color="inherit">
									<GaslessIcon width="100%" height="100%" />
								</SvgIcon>
							</ListItemIcon>
							<ListItemText primary={t("common.gaslessStaking")} />
						</RRListItem> */}
					</List>
				</Box>
				{/* <Box>
					<RRListItem
						id="side-nav-link-staking-landing-page"
						button
						className={clsx(classes.listItem)}
						onClick={() =>
							window.open(
								"https://www.adex.network/staking/",
								"_blank",
								"noopener,noreferrer"
							)
						}
					>
						<ListItemIcon color="inherit">
							<SvgIcon color="inherit">
								<HomeIcon color="inherit" />
							</SvgIcon>
						</ListItemIcon>
						<ListItemText primary={t("Home page")} />
					</RRListItem>
					<Divider />
					<ListItem>
						<Box>
							<div>
								<small>
									<Anchor
										id="external-link-adex-network"
										target="_blank"
										href={`https://adex.network`}
									>
										{t("company.copy", { year: new Date().getFullYear() })}
									</Anchor>
								</small>
							</div>
							<div>
								<small>
									<Anchor
										id="external-link-adex-network-tos"
										target="_blank"
										href={`https://adex.network/tos`}
									>
										{t("company.terms")}
									</Anchor>
								</small>
							</div>
							<div>
								<small>
									<Anchor
										id="external-link-adex-token"
										target="_blank"
										href={`https://etherscan.io/address/${ADDR_ADX}`}
									>
										{t("company.adxToken")}
									</Anchor>
								</small>
							</div>
							<div>
								<small>
									<Anchor
										id="external-link-adex-staking-overview"
										target="_blank"
										href="https://www.adex.network/blog/adex-defi-staking-overview/"
									>
										{t("company.version", { version: packageJson.version })}
									</Anchor>
								</small>
							</div>
						</Box>
					</ListItem>
				</Box> */}
			</Box>
		</Box>
	)
}

export default SideNav
