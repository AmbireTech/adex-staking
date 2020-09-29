import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
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
import { POOLS, MIN_BALANCE_FOR_GASLESS_TXNS } from "../helpers/constants"
import StatsCard from "./StatsCard"
import { formatADXPretty } from "../helpers/formatting"
import NewGaslessBondForm from "./NewGaslessBondForm"
import { ExternalAnchor } from "./Anchor"

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
		},
		content: {
			[theme.breakpoints.up("md")]: {
				maxWidth: 800
			}
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
		wrapDoingTxns
	} = useContext(AppContext)

	const {
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
					id="new-bond-form-adex-network-tos"
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
                                it's an automatically calculated (CREATE2) smart contract
                                address that will be created once the first transaction is issued.
                                `}
									>
										<HelpIcon color="primary" />
									</Tooltip>
								</Box>
							</Box>
							<Typography variant="h6" gutterBottom>
								{" - "} Deposit ADX to this address. When there's a minimum of{" "}
								<strong>{`${formatADXPretty(
									MIN_BALANCE_FOR_GASLESS_TXNS
								)} ADX`}</strong>{" "}
								deposited, you can click "Stake" and that amount will be staked
								without gas fees.
							</Typography>
							<Typography variant="h6" gutterBottom>
								{" - "} You can send ADX from wallets and exchanges as many
								times as you want before clicking "Stake".
							</Typography>
							<Typography variant="h6" gutterBottom>
								{" - "} Gasless staking is limited to one stake in 12 hours.
							</Typography>
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
												canExecuteGaslessError || "✅ Ready for gasless stake"
										})}
									</Box>
								</Box>
							)}
							<Box mt={2}>
								<Tooltip
									disableFocusListener={!disabled}
									disableHoverListener={!disabled}
									disableTouchListener={!disabled}
									title={
										walletConnected
											? canExecuteGaslessError || ""
											: "Connect wallet"
									}
								>
									<div>
										<Button
											id={`stake-gasless-form-open}`}
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
								{!disabled && (
									<Box mt={2}>
										{`Once you send your gasless transaction, it will take some time for it to be executed on the chain. Please be patient.
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
