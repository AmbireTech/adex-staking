import React from "react"
import {
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Typography,
	Box
} from "@material-ui/core"
import clsx from "clsx"
import Anchor from "./Anchor"
import logo from "./../adex-logo-white.svg"
import DashboardIcon from "@material-ui/icons/Dashboard"
import { makeStyles } from "@material-ui/core/styles"
import { useLocation } from "react-router-dom"
import packageJson from "./../../package.json"
import { ADDR_ADX } from "./../helpers/constants"
import WithRouterLink from "./WithRouterLink"
import UserData from "./UserData"

const RRListItem = WithRouterLink(ListItem)
const RRAdexIconTxt = logo // withReactRouterLink(AdexIconTxt)

const useStyles = makeStyles(theme => {
	const activeColor = theme.palette.primary.contrastText
	const activeBgColor = theme.palette.primary.main

	return {
		navigation: {
			backgroundColor: theme.palette.background.paper
		},
		sntPadding: {
			paddingTop: 0
		},
		navListRoot: {
			color: theme.palette.text.secondary,
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
			borderTopColor: theme.palette.divider,
			borderTopStyle: "solid"
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
				color: theme.palette.common.white
			}
		},
		adxLink: {
			color: theme.palette.text.hint,
			"&:hover": {
				color: theme.palette.text.secondary
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
		}
	}
})

function SideNav({
	prices,
	stats,
	onRequestUnbond,
	onUnbond,
	onClaimRewards,
	onRestake
}) {
	const classes = useStyles()
	const location = useLocation()
	const path = location.pathname

	return (
		<Box
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
			flexGrow="1"
		>
			<Box>
				<Box>
					<ListItem>
						<Box>
							<Box
								my={2}
								display="flex"
								flexDirection="row"
								alignItems="flex-start"
							>
								<img height="40vh" src={logo} alt="logo"></img>
								<Typography component="div">
									<Box
										ml={1}
										color="secondary.main"
										fontWeight="fontWeightRegular"
										fontSize={30}
									>
										Staking
									</Box>
								</Typography>
							</Box>

							{UserData({
								prices,
								stats,
								onRequestUnbond,
								onUnbond,
								onClaimRewards,
								onRestake
							})}
						</Box>
					</ListItem>
				</Box>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				justifyContent="space-between"
				flex="1"
			>
				<Box>
					<List>
						<Divider />
						<RRListItem
							button
							to={{ pathname: "/" }}
							className={clsx({ [classes.active]: path === "/" })}
						>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText primary={"Pools"} />
						</RRListItem>
						<Divider />
						<RRListItem
							button
							to={{ pathname: "/bonds" }}
							className={clsx({ [classes.active]: path === "/bonds" })}
						>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText primary={"Bonds"} />
						</RRListItem>
					</List>
				</Box>

				<Box>
					<Divider />
					<ListItem>
						<Box>
							<div>
								<small>
									{" "}
									&copy; {new Date().getFullYear()} &nbsp;
									<Anchor target="_blank" href={`https://adex.network`}>
										AdEx Network OÜ
									</Anchor>
								</small>
							</div>
							<div>
								<small>
									<Anchor target="_blank" href={`https://adex.network/tos`}>
										{"Terms and conditions"}
									</Anchor>
								</small>
							</div>
							<div>
								<small>
									<Anchor
										target="_blank"
										href={`https://etherscan.io/address/${ADDR_ADX}`}
									>
										AdEx (ADX) Token
									</Anchor>
								</small>
							</div>
							<div>
								<small>
									<Anchor
										target="_blank"
										href="https://www.adex.network/blog/adex-defi-staking-overview/"
									>
										v.{packageJson.version}
									</Anchor>
								</small>
							</div>
						</Box>
					</ListItem>
				</Box>
			</Box>
		</Box>
	)
}

export default SideNav
