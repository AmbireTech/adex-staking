import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
	Box,
	SvgIcon,
	Typography,
	IconButton,
	Button,
	Modal,
	Fade,
	Backdrop,
	Grid
} from "@material-ui/core"
import {
	FileCopySharp as CopyIcon,
	HelpSharp as HelpIcon
} from "@material-ui/icons"
import copy from "copy-to-clipboard"
import { ReactComponent as GaslessIcon } from "./../resources/gasless-ic.svg"
import SectionHeader from "./SectionHeader"
import AppContext from "../AppContext"
import { createNewBond, restake } from "../actions"
import {
	POOLS,
	MIN_BALANCE_FOR_GASLESS_TXNS,
	UNBOND_DAYS,
	ZERO
} from "../helpers/constants"
import StatsCard from "./StatsCard"
import { formatADXPretty } from "../helpers/formatting"
import NewGaslessBondForm from "./NewGaslessBondForm"
import { ExternalAnchor } from "./Anchor"
import Tooltip from "./Tooltip"
import ConfirmationDialog from "./ConfirmationDialog"

const MIN_GASLESS_RE_STAKE_REWARDS = MIN_BALANCE_FOR_GASLESS_TXNS.div(4)

const useStyles = makeStyles(theme => {
	return {
		overlay: {
			position: "absolute",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "transparent"
		},
		noUserData: {
			opacity: 0.23
		},
		address: {
			wordBreak: "break-all"
		},
		modal: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}
		// content: {
		// 	[theme.breakpoints.up("md")]: {
		// 		maxWidth: 800
		// 	}
		// }
	}
})

const Gasless = () => {
	const classes = useStyles()

	const [bondOpen, setBondOpen] = useState(false)
	const [reStakeOpen, setReStakeOpen] = useState(false)
	const [bond, setBond] = useState({})

	const {
		stats,
		setConnectWallet,
		addSnack,
		chosenWalletType,
		wrapDoingTxns
	} = useContext(AppContext)

	const {
		userIdentityBalance,
		identityAddr,
		loaded,
		canExecuteGasless,
		canExecuteGaslessError,
		tomRewardADX
	} = stats

	const hasEnoughForReStake = tomRewardADX.gte(MIN_GASLESS_RE_STAKE_REWARDS)

	const walletConnected = identityAddr && loaded
	const disabled = !walletConnected || !canExecuteGasless
	const disableReStake = disabled || !hasEnoughForReStake
	const canExecuteGaslessReStakeError =
		canExecuteGaslessError ||
		`Not enough rewards (min rewards for gasless re-stake ${formatADXPretty(
			MIN_GASLESS_RE_STAKE_REWARDS
		)} ADX)`
	const showReStake =
		walletConnected &&
		!(canExecuteGaslessError || "")
			.toLowerCase()
			.includes("needs to have at least")

	const onStake = async () => {
		setBondOpen(false)
		const res = await wrapDoingTxns(
			createNewBond.bind(null, stats, chosenWalletType, bond, true)
		)()

		if (res && res.txId) {
			addSnack(
				`Gasless transactions ${res.txId} sent!`,
				"success",
				20000,
				<ExternalAnchor
					color="inherit"
					id="new-gasless-stake-snack"
					target="_blank"
					href={`https://etherscan.io/tx/${res.txId}`}
				>
					See on Etherscan
				</ExternalAnchor>
			)
		}
	}

	const onReStake = async () => {
		setReStakeOpen(false)
		const res = await wrapDoingTxns(
			restake.bind(null, chosenWalletType, stats, true)
		)()

		if (res && res.txId) {
			addSnack(
				`Gasless transactions ${res.txId} sent!`,
				"success",
				20000,
				<ExternalAnchor
					color="inherit"
					id="new-gasless-re-stake-snack"
					target="_blank"
					href={`https://etherscan.io/tx/${res.txId}`}
				>
					See on Etherscan
				</ExternalAnchor>
			)
		}
	}

	useEffect(() => {
		setBond({
			poolId: POOLS[0].id,
			amount: userIdentityBalance
		})
	}, [identityAddr, userIdentityBalance, loaded])

	return (
		<Box>
			<SectionHeader
				title={"Gasless Staking"}
				actions={
					<Box
						color="text.main"
						fontSize={88}
						display="flex"
						flexDirection="row"
						alignItems="center"
					>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
					</Box>
				}
			/>
			<Box>
				<Box>
					<Box>
						<Box
							className={classes.content}
							mt={4}
							display="flex"
							flexDirection="column"
							alignItems="flex-start"
						>
							<Grid container spacing={2}>
								<Grid item xs={12} lg={7}>
									<Box>
										<Typography component="div" variant="h5">
											{"Gasless account address"}
										</Typography>
									</Box>
									<Box
										my={2}
										display="flex"
										flexDirection="row"
										alignItems="center"
										justifyContent="flex-start"
										flexGrow={0}
										flexWrap="wrap"
									>
										<Box
											display="flex"
											flexDirection="row"
											alignItems="center"
											justifyContent="flex-start"
											flexWrap="wrap"
											bgcolor="background.paper"
											color="text.main"
											fontSize={23}
											boxShadow={25}
										>
											<Box
												onClick={() => !identityAddr && setConnectWallet(true)}
												m={1}
												mx={2}
												classes={{ root: classes.address }}
												{...(!identityAddr
													? { style: { cursor: "pointer" } }
													: {})}
											>
												{identityAddr ||
													"connect wallet to see gasless staking address"}
											</Box>
											{identityAddr && (
												<Box m={1}>
													<IconButton
														id="mobile-burger-btn"
														color="secondary"
														aria-label="open drawer"
														onClick={() => {
															copy(identityAddr)
															addSnack(
																`Gasless Staking address ${identityAddr} copied to clipboard`,
																"success"
															)
														}}
													>
														<CopyIcon />
													</IconButton>
												</Box>
											)}
										</Box>
										<Box m={1}>
											<Tooltip
												title={`
												This is the address of your gasless account: 
												it's an automatically calculated (CREATE2) smart contract
												address that will be created once the first transaction is issued.
												`}
											>
												<HelpIcon color="primary" />
											</Tooltip>
										</Box>
									</Box>
									<Typography variant="h6" gutterBottom>
										{" • "} Deposit ADX to this address. When there's a minimum
										of{" "}
										<strong>{`${formatADXPretty(
											MIN_BALANCE_FOR_GASLESS_TXNS
										)} ADX`}</strong>{" "}
										deposited, you can click "Stake" and that amount will be
										staked without gas fees.
									</Typography>
									<Typography variant="h6" gutterBottom>
										{" • "} You can send ADX from wallets and exchanges as many
										times as you want before clicking "Stake".
									</Typography>
									<Typography variant="h6" gutterBottom>
										{" • "} Gasless staking is limited to one stake in 12 hours.
									</Typography>
								</Grid>
								<Grid item lg={5}></Grid>
								<Grid item xs={12} lg={6}>
									{walletConnected && (
										<Box mt={4}>
											<Box>
												{StatsCard({
													size: "large",
													loaded,
													title: "ADX BALANCE ON GASLESS ADDRESS",
													subtitle: userIdentityBalance
														? formatADXPretty(userIdentityBalance) + " ADX"
														: "",
													extra:
														canExecuteGaslessError ||
														"✅ Ready for gasless stake"
												})}
											</Box>
										</Box>
									)}

									<Box mt={2}>
										<Tooltip
											title={
												walletConnected
													? canExecuteGaslessError || ""
													: "Connect wallet"
											}
										>
											<Box display="inline-block">
												<Button
													// fullWidth
													id={`stake-gasless-form-open`}
													variant="contained"
													disableElevation
													color="secondary"
													size="large"
													onClick={() => setBondOpen(true)}
													disabled={disabled}
												>
													{"Stake"}
												</Button>
											</Box>
										</Tooltip>
									</Box>
								</Grid>
								<Grid item xs={12} lg={6}>
									{showReStake && (
										<Box>
											<Box mt={4}>
												<Box>
													{StatsCard({
														size: "large",
														loaded,
														title: "ADX REWARDS READY FOR RE-STAKE",
														subtitle: tomRewardADX
															? formatADXPretty(tomRewardADX) + " ADX"
															: "",
														extra:
															canExecuteGaslessReStakeError ||
															"✅ Ready for gasless re-stake"
													})}
												</Box>
											</Box>

											<Box>
												<Box mt={2}>
													<Tooltip
														title={
															walletConnected
																? canExecuteGaslessReStakeError || ""
																: "Connect wallet"
														}
													>
														<Box display="inline-block">
															<Button
																id={`re-stake-gasless-form-open`}
																// fullWidth
																variant="contained"
																disableElevation
																color="secondary"
																size="large"
																onClick={() => setReStakeOpen(true)}
																disabled={disableReStake}
															>
																{"RE-STAKE"}
															</Button>
														</Box>
													</Tooltip>
												</Box>
											</Box>
										</Box>
									)}
								</Grid>
								<Grid item xs={12} lg={7}>
									<Box mt={2}>
										{!disabled && (
											<Box mt={2}>
												{`Once you send your gasless transactions, it will take some time for it to be executed on the chain. Please be patient.
										Your stats will be updated when the transaction is confirmed. Confirmation time depends on network load.

										You can see all transactions of your gasless address `}
												<ExternalAnchor
													color="inherit"
													id="new-bond-form-adex-network-tos"
													target="_blank"
													href={`https://etherscan.io/address/${identityAddr}`}
												>
													{" HERE"}
												</ExternalAnchor>
											</Box>
										)}
									</Box>
								</Grid>
							</Grid>
						</Box>
					</Box>
				</Box>

				<Modal
					open={bondOpen}
					onClose={() => setBondOpen(false)}
					className={classes.modal}
					closeAfterTransition
					BackdropComponent={Backdrop}
					BackdropProps={{
						timeout: 300
					}}
				>
					<Fade in={bondOpen}>
						{NewGaslessBondForm({
							bond,
							onStake,
							chosenWalletType
						})}
					</Fade>
				</Modal>

				{ConfirmationDialog({
					isOpen: reStakeOpen,
					onDeny: () => setReStakeOpen(false),
					onConfirm: () => {
						onReStake()
					},
					confirmActionName: "Re-stake",
					content: (
						<>
							Are you sure you want to re-stake your earnings of{" "}
							{formatADXPretty(tomRewardADX ? tomRewardADX : ZERO)} ADX?
							<br />
							<br />
							Please be aware that this means that this amount will be locked up
							for at least {UNBOND_DAYS} days.
							<br />
							{!stats.userBonds.find(x => x.status === "Active")
								? "Your bond will be re-activated, meaning that your request to unbond will be cancelled but it will start earning rewards again."
								: ""}
						</>
					)
				})}
			</Box>
		</Box>
	)
}

export default Gasless
