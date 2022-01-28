import React, { Fragment, useContext, useState } from "react"
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
	Button
} from "@material-ui/core"
import {
	AccountBalanceWalletSharp as AccountBalanceWalletIcon,
	KeyboardArrowDown
} from "@material-ui/icons"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { formatAddress } from "../helpers/formatting"
import { Wallets, WALLET_CONNECT } from "../helpers/constants"
import copy from "copy-to-clipboard"
import { useTranslation } from "react-i18next"
import Tooltip from "./Tooltip"

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

	const {
		setConnectWallet,
		chosenWalletType,
		addSnack,
		account,
		onWalletTypeSelect,
		onWalletConnectionsDeactivate
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
								<Icon>
									<Jazzicon diameter={26} seed={jsNumberForAddress(account)} />
								</Icon>
							) : null
						}
						label={formatAddress(account)}
					/>
					<Tooltip title="Account settings">
						<Chip
							classes={{ root: classes.chipRoot, icon: classes.chipIcon }}
							clickable
							onClick={handleClick}
							size="medium"
							aria-controls={open ? "account-menu" : undefined}
							aria-haspopup="true"
							aria-expanded={open ? "true" : undefined}
							icon={icon ? <Avatar src={icon} /> : null}
							label={
								<Box fontSize="2rem" display="flex">
									<KeyboardArrowDown fontSize="large" />
								</Box>
							}
						/>
					</Tooltip>
					<Menu
						anchorEl={anchorEl}
						id="account-menu"
						open={open}
						onClose={handleClose}
						onClick={handleClose}
						transformOrigin={{ horizontal: "right", vertical: "bottom" }}
					>
						<MenuItem>
							<Button
								onClick={async () => {
									await onWalletTypeSelect(null)
									setConnectWallet(true)
								}}
							>
								Change wallet
							</Button>
						</MenuItem>
						{chosenWalletType.name === WALLET_CONNECT && (
							<MenuItem>
								<Button onClick={onWalletConnectionsDeactivate}>
									Disconnect
								</Button>
							</MenuItem>
						)}
					</Menu>
				</Box>
			)}
		</Fragment>
	)
}
