import React, { useState, useContext } from "react"
import { Switch, Route } from "react-router-dom"
import { makeStyles } from "@material-ui/core/styles"
import {
	Drawer,
	Modal,
	Backdrop,
	Fade,
	Snackbar,
	useMediaQuery
} from "@material-ui/core"
import { Alert as MuiAlert } from "@material-ui/lab"
import ChooseWallet from "./ChooseWallet"
import Stakings from "./Stakings"
import Pools from "./Pools"
import NewBondForm from "./NewBondForm"
import LegacyADXSwapDialog from "./LegacyADXSwapDialog"
import ConfirmationDialog from "./ConfirmationDialog"
import { AppToolbar } from "./Toolbar"
import SideNav from "./SideNav"
import { ZERO, UNBOND_DAYS, POOLS } from "../helpers/constants"
import { formatADXPretty } from "../helpers/formatting"
import { styles } from "./rootStyles"
import AppContext from "../AppContext"
import { createNewBond } from "../actions"
import { ShtarvolinkiSnack } from "./../Snack"

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />
}

const { REACT_APP_RPC_URL } = process.env

const useStyles = makeStyles(styles)

export default function Root() {
	const classes = useStyles()
	const [mobileOpen, setMobileOpen] = useState(false)
	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}
	const isTempDrawer = useMediaQuery(theme => theme.breakpoints.down("sm"))

	const {
		isNewBondOpen,
		setNewBondOpen,
		toUnbond,
		setToUnbond,
		toRestake,
		setToRestake,
		openErr,
		openDoingTx,
		snackbarErr,
		stats,
		connectWallet,
		setConnectWallet,
		chosenWalletType,
		wrapDoingTxns,
		onRequestUnbond,
		onUnbond,
		onClaimRewards,
		onRestake,
		handleErrClose,
		getSigner,
		prices,
		onWalletTypeSelect,
		snackHooks
	} = useContext(AppContext)

	const drawer = SideNav({
		prices,
		stats,
		onRequestUnbond: setToUnbond,
		onUnbond,
		onClaimRewards,
		onRestake: setToRestake,
		setConnectWallet
	})

	const container = window !== undefined ? document.body : undefined

	return (
		<div className={classes.root}>
			<AppToolbar
				chosenWalletType={chosenWalletType}
				setConnectWallet={setConnectWallet}
				setNewBondOpen={setNewBondOpen}
				handleDrawerToggle={handleDrawerToggle}
				stats={stats}
			/>

			<nav aria-label="side navigation">
				<Drawer
					container={container}
					variant={isTempDrawer ? "temporary" : "permanent"}
					anchor="left"
					open={isTempDrawer ? mobileOpen : true}
					onClose={handleDrawerToggle}
					classes={{
						paper: classes.drawerPaper
					}}
					ModalProps={{
						keepMounted: true // Better open performance on mobile.
					}}
				>
					{drawer}
				</Drawer>
			</nav>
			<main className={classes.content}>
				<div className={classes.contentInner}>
					<Switch>
						<Route path="/stakings">
							<Stakings />
						</Route>
						<Route path="/">
							<Pools />
						</Route>
					</Switch>

					{// Load stats first to prevent simultanious calls to getSigner
					LegacyADXSwapDialog(
						stats.loaded ? getSigner : null,
						wrapDoingTxns,
						chosenWalletType
					)}

					{ConfirmationDialog({
						isOpen: !!toUnbond,
						onDeny: () => setToUnbond(null),
						onConfirm: () => {
							if (toUnbond) onRequestUnbond(toUnbond)
							setToUnbond(null)
						},
						confirmActionName: "Unbond",
						content: (
							<>
								Are you sure you want to request unbonding of{" "}
								{formatADXPretty(toUnbond ? toUnbond.currentAmount : ZERO)} ADX?
								<br />
								<br />
								Please be aware:
								<ol>
									<li>
										It will take {UNBOND_DAYS} days before you will be able to
										withdraw your ADX!
									</li>
									<li>
										You will not receive staking rewards for this amount in this{" "}
										{UNBOND_DAYS} day period.
									</li>
								</ol>
							</>
						)
					})}

					{ConfirmationDialog({
						isOpen: !!toRestake,
						onDeny: () => setToRestake(null),
						onConfirm: () => {
							if (toRestake) onRestake()
							setToRestake(null)
						},
						confirmActionName: "Re-stake",
						content: (
							<>
								Are you sure you want to stake your earnings of{" "}
								{formatADXPretty(toRestake ? toRestake : ZERO)} ADX?
								<br />
								<br />
								Please be aware that this means that this amount will be locked
								up for at least {UNBOND_DAYS} days.
								<br />
								{!stats.userBonds.find(x => x.status === "Active")
									? "Your bond will be re-activated, meaning that your request to unbond will be cancelled but it will start earning rewards again."
									: ""}
							</>
						)
					})}

					{ChooseWallet({
						open: !!connectWallet,
						content: "",
						handleClose: () => {
							setConnectWallet(null)
						},
						handleListItemClick: onWalletTypeSelect,
						disableNonBrowserWallets: !REACT_APP_RPC_URL
					})}

					<Snackbar open={openDoingTx}>
						<Alert severity="info">
							Please sign all pending MetaMask actions!
						</Alert>
					</Snackbar>
					<Snackbar
						open={openErr}
						autoHideDuration={10000}
						onClose={handleErrClose}
					>
						<Alert
							id={`err-aler-${snackbarErr.replaceAll(" ", "-").toLowerCase()}`}
							onClose={handleErrClose}
							severity="error"
						>
							{snackbarErr}
						</Alert>
					</Snackbar>
					<ShtarvolinkiSnack {...snackHooks} />

					<Modal
						open={isNewBondOpen}
						onClose={() => setNewBondOpen(false)}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						}}
						closeAfterTransition
						BackdropComponent={Backdrop}
						BackdropProps={{
							timeout: 300
						}}
					>
						<Fade in={isNewBondOpen}>
							{NewBondForm({
								pools: POOLS.filter(x => x.selectable),
								totalStake: stats.totalStake,
								maxAmount: stats.userBalance,
								onNewBond: async bond => {
									setNewBondOpen(false)
									await wrapDoingTxns(
										createNewBond.bind(null, stats, chosenWalletType, bond)
									)()
								},
								chosenWalletType,
								isEarly: stats.userBonds.find(
									x => x.nonce.toNumber() < 1597276800
								)
							})}
						</Fade>
					</Modal>
				</div>
			</main>
		</div>
	)
}
