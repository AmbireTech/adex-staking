import React, { Fragment, useContext, useEffect, useState } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import {
	Chip,
	Fab,
	Icon,
	Avatar,
	Box,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Link,
	Grid
} from "@material-ui/core"
import {
	AccountBalanceWalletSharp as AccountBalanceWalletIcon,
	KeyboardArrowDown,
	OpenInNew,
	LinkOff
} from "@material-ui/icons"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { formatAddress } from "../helpers/formatting"
import {
	METAMASK,
	Wallets
	// WALLET_CONNECT
} from "../helpers/constants"
import copy from "copy-to-clipboard"
import { useTranslation } from "react-i18next"
import Tooltip from "./Tooltip"
import { getPeerMeta } from "../ethereum"
import * as blockies from "blockies-ts"

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	},
	chipRoot: {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.main,
		fontWeight: theme.typography.fontWeightBold,
		fontSize: theme.typography.pxToRem(15),
		// To match medium size fab
		height: 40,
		borderRadius: 40 / 2
	},
	chipIcon: {
		marginLeft: 9,
		marginRight: 0,
		width: 26,
		height: 26
	}
}))

export const Wallet = () => {
	const { t } = useTranslation()
	const classes = useStyles()
	const [peerMeta, setPeerMeta] = useState(null)

	const {
		setConnectWallet,
		chosenWalletType,
		addSnack,
		account,
		// onWalletTypeSelect,
		// connector,
		onConnectionDisconnect
	} = useContext(AppContext)
	const [anchorEl, setAnchorEl] = useState(null)
	const open = Boolean(anchorEl)
	const handleClick = event => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	const { icon } = Wallets.find(x => x.name === chosenWalletType.name) || {}

	useEffect(() => {
		async function getMeta() {
			const meta = await getPeerMeta(chosenWalletType)
			setPeerMeta(meta)
		}

		!!chosenWalletType?.library && getMeta()
	}, [chosenWalletType])

	return (
		<Fragment>
			{!chosenWalletType.name || !account ? (
				<Fab
					id="connect-wallet-btn-topbar"
					onClick={() => setConnectWallet(true)}
					variant="extended"
					color="secondary"
					size="medium"
					disabled={chosenWalletType.name && !account}
				>
					<AccountBalanceWalletIcon className={classes.fabIcon} />
					{t("common.connectWallet")}
				</Fab>
			) : (
				<Grid container spacing={1} justifyContent="flex-end">
					<Grid item>
						<Box>
							<Chip
								id="wallet-address-top-bar-copy"
								onClick={() => {
									copy(account)
									addSnack(t("messages.addrCopied", { account }), "success")
								}}
								clickable
								classes={{ root: classes.chipRoot, icon: classes.chipIcon }}
								icon={
									account ? (
										chosenWalletType.name === METAMASK ? (
											<Icon>
												<Jazzicon
													diameter={26}
													seed={jsNumberForAddress(account)}
												/>
											</Icon>
										) : (
											<Avatar
												src={blockies.create({ seed: account }).toDataURL()}
											/>
										)
									) : null
								}
								label={formatAddress(account)}
							/>
						</Box>
					</Grid>
					<Grid item>
						<Tooltip title="Account settings">
							<Chip
								classes={{ root: classes.chipRoot, icon: classes.chipIcon }}
								clickable
								onClick={handleClick}
								size="medium"
								aria-controls={open ? "account-menu" : undefined}
								aria-haspopup="true"
								aria-expanded={open ? "true" : undefined}
								icon={
									icon || peerMeta?.icons ? (
										<Avatar src={peerMeta?.icons ? peerMeta.icons[0] : icon} />
									) : null
								}
								label={
									<Box display="flex" flexDirection="row" alignItems="center">
										{peerMeta?.name || chosenWalletType.name}
										<KeyboardArrowDown fontSize="large" />
									</Box>
								}
							/>
						</Tooltip>
					</Grid>
					<Grid item>
						<Menu
							anchorEl={anchorEl}
							id="account-menu"
							open={open}
							onClose={handleClose}
							onClick={handleClose}
							transformOrigin={{ horizontal: "right", vertical: "bottom" }}
						>
							<MenuItem button onClick={onConnectionDisconnect}>
								<ListItemIcon>
									<LinkOff fontSize="small" />
								</ListItemIcon>
								<ListItemText>Disconnect</ListItemText>
							</MenuItem>

							{peerMeta && (
								<Link
									id="wc-peer-meta-link"
									color="inherit"
									href={peerMeta.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									<MenuItem ic={OpenInNew} onClick={handleClose}>
										<ListItemIcon>
											<OpenInNew fontSize="small" />
										</ListItemIcon>
										<ListItemText>{peerMeta.name}</ListItemText>
									</MenuItem>
								</Link>
							)}
						</Menu>
					</Grid>
				</Grid>
			)}
		</Fragment>
	)
}
