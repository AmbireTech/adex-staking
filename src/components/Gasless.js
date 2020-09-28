import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import clsx from "clsx"
import {
	Box,
	SvgIcon,
	Typography,
	IconButton,
	Tooltip,
	Button,
	Modal,
	Fade,
	Backdrop
} from "@material-ui/core"
import {
	FileCopySharp as CopyIcon,
	HelpSharp as HelpIcon
} from "@material-ui/icons"
import copy from "copy-to-clipboard"
import { ReactComponent as GaslessIcon } from "./../resources/gasless-ic.svg"
import SectionHeader from "./SectionHeader"
import AppContext from "../AppContext"
import { createNewBond } from "../actions"
import { POOLS } from "../helpers/constants"
import StatsCard from "./StatsCard"
import { formatADXPretty } from "../helpers/formatting"
import NewGaslessBondForm from "./NewGaslessBondForm"

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
	}
})

const Gasless = () => {
	const classes = useStyles()

	const [bondOpen, setBondOpen] = useState(false)
	const [bond, setBond] = useState({})

	const {
		stats,
		setConnectWallet,
		addSnack,
		chosenWalletType,
		wrapDoingTxns,
		prices
	} = useContext(AppContext)

	const {
		connectedWalletAddress,
		userIdentityBalance,
		identityAddr,
		loaded,
		canExecuteGasless,
		canExecuteGaslessError
	} = stats

	const walletConnected = identityAddr && loaded
	const disabled = !walletConnected || !canExecuteGasless

	const onStake = async () => {
		setBondOpen(false)
		await wrapDoingTxns(
			createNewBond.bind(null, stats, chosenWalletType, bond, true)
		)()
	}

	useEffect(() => {
		setBond({
			poolId: POOLS[0].id,
			amount: userIdentityBalance
		})
	}, [identityAddr, userIdentityBalance, loaded])

	return (
		<Box>
			<SectionHeader title={"Gasless Staking"} />
			<Box>
				<Box>
					<Box mt={4} color="text.main" fontSize={88}>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
					</Box>
					<Box>
						<Box
							mt={4}
							display="flex"
							flexDirection="column"
							alignItems="flex-start"
						>
							<Box>
								<Typography component="div" variant="h5">
									{"Gasless account address"}
								</Typography>
							</Box>
							<Box
								mt={2}
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
								>
									<Box
										onClick={() => !identityAddr && setConnectWallet(true)}
										m={1}
										mx={2}
										classes={{ root: classes.address }}
										{...(!identityAddr ? { style: { cursor: "pointer" } } : {})}
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
                                it's an automatically calculated (CRAETE2) smart contract 
                                address that will be created once the first transaction is issued.
                                `}
									>
										<HelpIcon color="primary" />
									</Tooltip>
								</Box>
							</Box>
							<Box mt={2}>
								{`
                                Deposit ADX to this address. When there's a minimum of хххх ADX deposited, 
                                you can click "Stake" and that amount will be staked without gas fees. 
                                You can send ADX from wallets and exchanges as many times as you want before clicking "Stake".                                    
                            `}
							</Box>
							{walletConnected && (
								<Box mt={2}>
									<Box mb={1.5}>
										{StatsCard({
											size: "large",
											loaded,
											title: "ADX BALANCE ON GASLESS ADDRESS",
											subtitle: userIdentityBalance
												? formatADXPretty(userIdentityBalance) + " ADX"
												: ""
										})}
									</Box>
								</Box>
							)}
							<Box>
								<Tooltip
									disableFocusListener={!disabled}
									disableHoverListener={!disabled}
									disableTouchListener={!disabled}
									title={!canExecuteGasless ? canExecuteGaslessError || "" : ""}
								>
									<div>
										<Button
											id={`stake-gasless-form-open}`}
											fullWidth
											variant="contained"
											disableElevation
											color="secondary"
											size="large"
											onClick={() => setBondOpen(true)}
											disabled={disabled}
										>
											{"Stake"}
										</Button>
									</div>
								</Tooltip>
							</Box>
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
			</Box>
		</Box>
	)
}

export default Gasless
