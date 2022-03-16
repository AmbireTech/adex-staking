import React, { useContext, useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Box, SvgIcon, Typography, IconButton } from "@material-ui/core"
import {
	FileCopySharp as CopyIcon,
	HelpSharp as HelpIcon
} from "@material-ui/icons"
import copy from "copy-to-clipboard"
import { ReactComponent as GaslessIcon } from "./../resources/gasless-ic.svg"
import SectionHeader from "./SectionHeader"
import AppContext from "../AppContext"
import { getGaslessInfo } from "../actions"
import { MIN_BALANCE_FOR_GASLESS_TXNS } from "../helpers/constants"
import StatsCard from "./StatsCard"
import { formatADXPretty } from "../helpers/formatting"
import NewGaslessBondForm from "./NewGaslessBondForm"
import WithDialog from "./WithDialog"
import { ExternalAnchor } from "./Anchor"
import Tooltip from "./Tooltip"
import { useTranslation, Trans } from "react-i18next"

const GaslessDepositDialog = WithDialog(NewGaslessBondForm)

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
	const [gaslessInfo, setGaslessInfo] = useState(defaultGaslessInfo)

	const { stats, setConnectWallet, addSnack, account } = useContext(AppContext)

	const { tomStakingV5PoolStats, connectedWalletAddress } = stats

	const {
		userDataLoaded,
		gaslessAddress,
		gaslessAddrBalance
	} = tomStakingV5PoolStats

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

	const walletConnected =
		gaslessAddress &&
		userDataLoaded &&
		connectedWalletAddress &&
		connectedWalletAddress === account

	const mainErr = !walletConnected
		? t("common.connectWallet")
		: !canExecuteGasless
		? t(gaslessError.message || "", gaslessError.data || {})
		: ""

	const canExecuteGaslessError =
		mainErr || (gaslessAddrBalance.isZero() ? t("errors.nothingToStake") : "")

	const insufficientForGasless =
		!gaslessAddrBalance.isZero() &&
		gaslessAddrBalance.lt(MIN_BALANCE_FOR_GASLESS_TXNS)

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
									bgcolor="background.card"
									color="text.main"
									fontSize={23}
									boxShadow={25}
								>
									<Box
										onClick={() => !gaslessAddress && setConnectWallet(true)}
										m={1}
										mx={2}
										classes={{ root: classes.address }}
										{...(!gaslessAddress
											? { style: { cursor: "pointer" } }
											: {})}
									>
										{walletConnected
											? gaslessAddress
											: t("gasless.connectWalletToSeeAddr")}
									</Box>
									{walletConnected && (
										<Box m={1}>
											<IconButton
												id="mobile-burger-btn"
												color="secondary"
												aria-label="open drawer"
												onClick={() => {
													copy(gaslessAddress)
													addSnack(
														t("gasless.copiedToClipboard", {
															identityAddr: gaslessAddress
														}),
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
													loaded: userDataLoaded,
													title: t("gasless.adxBalanceOnAddr"),
													subtitle: gaslessAddrBalance
														? formatADXPretty(gaslessAddrBalance) + " ADX"
														: "",
													extra:
														canExecuteGaslessError || t("gasless.readyForStake")
												})}
											</Box>
										</Box>
									)}

									<Box mt={2}>
										<GaslessDepositDialog
											id="staking-pool-tom-gasless-deposit-form"
											title={t("deposits.depositTo", {
												pool: t("common.tomStakingPool")
											})}
											btnLabel={t("common.deposit")}
											color="secondary"
											size="large"
											variant="contained"
											fullWidth
											disabled={!!canExecuteGaslessError}
											tooltipTitle={canExecuteGaslessError}
											onTxRes={onTxRes}
										/>
									</Box>

									{insufficientForGasless && canExecuteGaslessError && (
										<Box mt={4}>
											<Box mb={2}>
												<Typography variant="caption" gutterBottom>
													{t("deposits.depositGaslessNoGaslessBtnInfo")}
												</Typography>
											</Box>
											<GaslessDepositDialog
												id="staking-pool-tom-gasless-deposit-form-no-gasless"
												title={t("deposits.depositTo", {
													pool: t("common.tomStakingPool")
												})}
												btnLabel={t("deposits.depositGaslessNoGaslessBtn")}
												color="secondary"
												size="small"
												variant="contained"
												fullWidth
												noGasless={true}
												// disabled={!!canExecuteGaslessError}
												// tooltipTitle={canExecuteGaslessError}
												onTxRes={onTxRes}
											/>
										</Box>
									)}
								</Box>
							</Box>
							<Box mt={2}>
								{!canExecuteGaslessError && (
									<Box mt={2}>
										<Trans
											i18nKey="gasless.info"
											components={{
												external: (
													<ExternalAnchor
														color="inherit"
														id="new-bond-form-adex-network-tos"
														target="_blank"
														href={`https://etherscan.io/address/${gaslessAddress}`}
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
			</Box>
		</Box>
	)
}

export default Gasless
