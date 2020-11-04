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
import { createNewBond, restake, getGaslessInfo } from "../actions"
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
import { useTranslation, Trans } from "react-i18next"

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
		},
		bullets: {
			[theme.breakpoints.up("md")]: {
				maxWidth: 800
			}
		},
		actions: {
			maxWidth: 400,
			margin: theme.spacing(1)
		}
	}
})

const defaultGaslessInfo = {
	canExecuteGasless: false,
	canExecuteGaslessError: {
		message: "common.connectWallet"
	}
}

const Gasless = () => {
	const { t } = useTranslation()
	const classes = useStyles()
	const [bondOpen, setBondOpen] = useState(false)
	const [reStakeOpen, setReStakeOpen] = useState(false)
	const [bond, setBond] = useState({})
	const [gaslessInfo, setGaslessInfo] = useState(defaultGaslessInfo)

	const {
		stats,
		setConnectWallet,
		addSnack,
		chosenWalletType,
		wrapDoingTxns,
		account
	} = useContext(AppContext)

	const {
		userIdentityBalance,
		identityAddr,
		loaded,
		tomRewardADX,
		userBonds
	} = stats

	const {
		canExecuteGasless,
		canExecuteGaslessError: gaslessError
	} = gaslessInfo

	useEffect(() => {
		async function updateGasless() {
			console.log("account", account)

			const info = await getGaslessInfo(account)
			setGaslessInfo(info)
		}

		if (account) {
			updateGasless()
		} else {
			setGaslessInfo(defaultGaslessInfo)
		}
	}, [account])

	const hasEnoughForReStake = tomRewardADX.gte(MIN_GASLESS_RE_STAKE_REWARDS)

	const walletConnected = identityAddr && loaded

	const mainErr = !walletConnected
		? "common.connectWallet"
		: !canExecuteGasless
		? t(gaslessError.message || "", gaslessError.data || {})
		: ""

	const canExecuteGaslessReStakeError =
		mainErr ||
		(!hasEnoughForReStake
			? t("errors.minGaslessReStake", {
					amount: formatADXPretty(MIN_GASLESS_RE_STAKE_REWARDS),
					currency: "ADX"
			  })
			: "")

	const canExecuteGaslessError =
		mainErr || (userIdentityBalance.isZero() ? t("errors.nothingToStake") : "")

	const showReStake =
		walletConnected &&
		userBonds &&
		userBonds.some(x => x.poolId === POOLS[0].id)
	// NOTE: When there is old account with rewards
	// and 20 000 on the identity - if the identity is not deployed
	// If you gasless re-stake the rewards you will stake the amount on
	// the identity as well without notification
	// TODO: maybe add notification

	const onTxRes = (res, btnId) => {
		if (res && res.txId) {
			addSnack(
				t("gasless.txSent", { txId: res.txId }),
				"success",
				20000,
				<ExternalAnchor
					color="inherit"
					id={btnId}
					target="_blank"
					href={`https://etherscan.io/tx/${res.txId}`}
				>
					{t("common.seeOnEtherscan")}
				</ExternalAnchor>
			)
		}
	}

	const onStake = async () => {
		setBondOpen(false)
		const res = await wrapDoingTxns(
			createNewBond.bind(null, stats, chosenWalletType, bond, true)
		)()

		onTxRes(res, "new-gasless-stake-snack")
	}

	const onReStake = async () => {
		setReStakeOpen(false)
		const res = await wrapDoingTxns(
			restake.bind(null, chosenWalletType, stats, true)
		)()

		onTxRes(res, "new-gasless-re-stake-snack")
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
				title={t("gasless.staking")}
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
									{t("gasless.accountAddr")}
								</Typography>
							</Box>
							<Box
								my={2}
								display="flex"
								flexDirection="row"
								alignItems="center"
								justifyContent="flex-start"
								flexGrow={0}
								// flexWrap="wrap"
							>
								<Box
									display="flex"
									flexDirection="row"
									alignItems="center"
									justifyContent="flex-start"
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
										{identityAddr || t("gasless.connectWalletToSeeAddr")}
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
														t("gasless.copiedToClipboard", { identityAddr }),
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
									<Tooltip title={t("gasless.addrTooltip")}>
										<HelpIcon color="primary" />
									</Tooltip>
								</Box>
							</Box>
							<Box className={classes.bullets}>
								<Typography variant="h6" gutterBottom>
									{" • "}
									<Trans
										i18nKey="gasless.bullet1"
										values={{
											minBalance: formatADXPretty(MIN_BALANCE_FOR_GASLESS_TXNS),
											currency: "ADX"
										}}
									/>
								</Typography>
								<Typography variant="h6" gutterBottom>
									{" • "}
									<Trans i18nKey="gasless.bullet2" />
								</Typography>
								<Typography variant="h6" gutterBottom>
									{" • "}
									<Trans
										i18nKey="gasless.bullet3"
										values={{
											count: 12
										}}
									/>
								</Typography>
							</Box>
							<Box display="flex" flexDirection="row" flexWrap="wrap">
								<Box className={classes.actions}>
									{walletConnected && (
										<Box mt={4}>
											<Box>
												{StatsCard({
													size: "large",
													loaded,
													title: t("gasless.adxBalanceOnAddr"),
													subtitle: userIdentityBalance
														? formatADXPretty(userIdentityBalance) + " ADX"
														: "",
													extra:
														canExecuteGaslessError || t("gasless.readyForStake")
												})}
											</Box>
										</Box>
									)}

									<Box mt={2}>
										<Tooltip
											title={
												walletConnected
													? canExecuteGaslessError || ""
													: t("common.connectWallet")
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
													disabled={!!canExecuteGaslessError}
												>
													{t("common.stake")}
												</Button>
											</Box>
										</Tooltip>
									</Box>
								</Box>
								{showReStake && (
									<Box className={classes.actions}>
										<Box mt={4}>
											<Box>
												{StatsCard({
													size: "large",
													loaded,
													title: t("gasless.rewardsReadyForReStake"),
													subtitle: tomRewardADX
														? formatADXPretty(tomRewardADX) + " ADX"
														: "",
													extra:
														canExecuteGaslessReStakeError ||
														t("gasless.readyForReStake")
												})}
											</Box>
										</Box>

										<Box>
											<Box mt={2}>
												<Tooltip
													title={
														walletConnected
															? canExecuteGaslessReStakeError || ""
															: t("common.connectWallet")
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
															disabled={!!canExecuteGaslessReStakeError}
														>
															{t("gasless.reStakeRewards")}
														</Button>
													</Box>
												</Tooltip>
											</Box>
										</Box>
									</Box>
								)}
							</Box>
							<Box mt={2}>
								{(!canExecuteGaslessError ||
									!canExecuteGaslessReStakeError) && (
									<Box mt={2}>
										<Trans
											i18nKey="gasless.info"
											components={{
												external: (
													<ExternalAnchor
														color="inherit"
														id="new-bond-form-adex-network-tos"
														target="_blank"
														href={`https://etherscan.io/address/${identityAddr}`}
													/>
												)
											}}
										/>
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

				{ConfirmationDialog({
					isOpen: reStakeOpen,
					onDeny: () => setReStakeOpen(false),
					onConfirm: () => {
						onReStake()
					},
					confirmActionName: t("common.reStake"),
					content: (
						<Trans
							i18nKey="dialogs.reStakeConfirmation"
							values={{
								amount: formatADXPretty(tomRewardADX ? tomRewardADX : ZERO),
								currency: "ADX",
								unbondDays: UNBOND_DAYS,
								extraInfo: !stats.userBonds.find(x => x.status === "Active")
									? t("dialogs.reActivatingInfo")
									: ""
							}}
							components={{
								box: <Box mb={2}></Box>
							}}
						/>
					)
				})}
			</Box>
		</Box>
	)
}

export default Gasless
