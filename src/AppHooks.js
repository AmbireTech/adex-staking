import { useEffect, useState, useCallback } from "react"
import {
	useWeb3React,
	UnsupportedChainIdError,
	PRIMARY_KEY
} from "@web3-react/core"
import {
	NoEthereumProviderError,
	UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector"
import { useIdleTimer } from "react-idle-timer"
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector"
import { getSigner } from "./ethereum"
import {
	WALLET_CONNECT,
	METAMASK,
	TREZOR,
	LEDGER,
	GNOSIS_SAFE,
	SUPPORTED_CHAINS,
	IDLE_TIMEOUT_MINUTES
} from "./helpers/constants"
import {
	injected,
	trezor,
	ledger,
	walletconnect,
	gnosisSafe
} from "./helpers/connector"
import {
	EMPTY_STATS,
	loadStats,
	onUnbondOrRequest,
	claimRewards,
	getPrices,
	reBond,
	onMigrationToV5Finalize
} from "./actions"
import { useSnack } from "./Snack"
import ChooseWallet from "components/ChooseWallet"
import {
	loadFromLocalStorage,
	removeFromLocalStorage,
	saveToLocalStorage
} from "./helpers/localStorage"

const REFRESH_INTVL = 300_000 // 300sec
const REFRESH_INTVL_WALLET = 60_000 // 60sec
const IDLE_TIMEOUT = IDLE_TIMEOUT_MINUTES * 60 * 1000

const connectorsByName = {
	[GNOSIS_SAFE]: gnosisSafe,
	[METAMASK]: injected,
	[WALLET_CONNECT]: walletconnect,
	[TREZOR]: trezor,
	[LEDGER]: ledger
}

function tryGetErrMessage(error) {
	if (error && error.message) {
		return error.message
	} else if (typeof error === "string") {
		return error
	} else {
		return null
	}
}

function getErrorMessage(error) {
	if (error instanceof NoEthereumProviderError) {
		return "errors.noEthBrowserDetected"
	} else if (error instanceof UnsupportedChainIdError) {
		return "errors.connectedToUnsupportedNetwork"
	} else if (
		error instanceof UserRejectedRequestErrorInjected ||
		error instanceof UserRejectedRequestErrorWalletConnect
	) {
		return "errors.siteNotAuth"
	} else if (tryGetErrMessage(error)) {
		console.error(error)
		return tryGetErrMessage(error)
	} else {
		console.error(error)
		return "errors.unknownCheckConsole"
	}
}

export default function useApp() {
	const { addSnack, ...snackHooks } = useSnack()

	const {
		library,
		activate,
		error,
		deactivate,
		chainId: web3ReactChainId,
		account: web3ReactAccount,
		connector
		// active
	} = useWeb3React()

	const [isNewBondOpen, setNewBondOpen] = useState(false)
	const [toUnbond, setToUnbond] = useState(null)
	const [openErr, setOpenErr] = useState(false)
	const [openDoingTx, setOpenDoingTx] = useState(false)
	const [snackbarErr, setSnackbarErr] = useState("errors.unexpectedError")
	const [stats, setStats] = useState(EMPTY_STATS)
	const [connectWallet, setConnectWallet] = useState(null)
	const [chosenWalletTypeName, setChosenWalletTypeName] = useState(null)
	const [chosenWalletType, setChosenWalletType] = useState({})
	const [prices, setPrices] = useState({})
	const [chainWarning, setChainWarning] = useState(false)
	const [newBondPool, setNewBondPool] = useState(null)
	const [legacySwapInPrg, setLegacySwapInPrg] = useState(false)
	const [legacySwapOpen, setLegacySwapInOpen] = useState(false)
	const [refreshCount, setRefreshCount] = useState(0)
	const [userIdle, setUserIdle] = useState(false)
	const [idlePopupOpen, setIdlePopupOpen] = useState(false)
	const [updatingStats, setUpdatingStats] = useState(false)
	const [accountData, setAccountData] = useState({})

	const { account, chainId } = accountData

	const handleOnIdle = () => {
		setUserIdle(true)
		setIdlePopupOpen(true)
	}

	const onIdleDialogAction = useCallback(() => {
		setIdlePopupOpen(false)
		setUserIdle(false)
	}, [setIdlePopupOpen, setUserIdle])

	useIdleTimer({
		timeout: IDLE_TIMEOUT,
		onIdle: handleOnIdle,
		debounce: 500
	})

	useEffect(() => {
		if (chosenWalletType.name) {
			setAccountData({
				account: web3ReactAccount,
				chainId: web3ReactChainId
			})
		} else {
			setAccountData({})
		}
	}, [chosenWalletType, web3ReactAccount, web3ReactChainId])

	useEffect(() => {
		setChosenWalletType({ ...chosenWalletType, library })
	}, [library])

	useEffect(() => {
		const name = loadFromLocalStorage("chosenWalletTypeName")
		if (name) {
			onWalletTypeSelect(name)
		}
	}, [])

	useEffect(() => {
		saveToLocalStorage(chosenWalletTypeName, "chosenWalletTypeName")
	}, [chosenWalletTypeName])

	useEffect(() => {
		if (connector) {
			connector.on("transport_error", (error, payload) => {
				console.error("WalletConnect transport error", payload)
				setSnackbarErr({
					msg: "WalletConnect transport error"
				})
				setOpenErr(true)
				// TODO: connections broken check
			})
		}

		return () => {
			if (connector) {
				connector.removeAllListeners()
			}
		}
	}, [connector])

	const refreshStats = useCallback(async () => {
		const isAccountChanged = stats.connectedWalletAddress !== account
		await setUpdatingStats(isAccountChanged)
		await setStats({ ...(isAccountChanged ? EMPTY_STATS : stats) })

		if (userIdle) return

		if (chosenWalletType.name && !chosenWalletType.library) {
			return
		}

		const newPrices =
			!Object.keys(prices) || refreshCount % 3 === 0
				? await getPrices()
				: prices
		const updatePrices = newPrices !== prices

		try {
			const newStats = await loadStats(
				chosenWalletType,
				updatePrices ? newPrices : prices
			)
			setRefreshCount(refreshCount + 1)
			setStats(newStats)
			if (updatePrices) {
				setPrices(newPrices)
			}
		} catch (e) {
			console.error("loadStats", e)
			if (e.code === 4001) {
				setSnackbarErr("errors.authDeniedByUser")
			} else {
				setSnackbarErr({
					msg: "errors.loadingStats",
					opts: { error: !!e ? e.message || e.toString() : "" }
				})
			}

			setOpenErr(true)
		}

		setUpdatingStats(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		stats.connectedWalletAddress,
		userIdle,
		account,
		refreshCount,
		prices,
		chosenWalletType
	])

	useEffect(() => {
		refreshStats()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType, account])

	useEffect(() => {
		const refreshInterval = chosenWalletType.name
			? REFRESH_INTVL_WALLET
			: REFRESH_INTVL
		let intvl = setInterval(refreshStats, refreshInterval)

		return () => {
			clearInterval(intvl)
			intvl = null
		}
	}, [chosenWalletType.name, refreshStats])

	useEffect(() => {
		if (!!chainId && !SUPPORTED_CHAINS.some(chain => chainId === chain.id)) {
			setChainWarning(true)
		} else {
			setChainWarning(false)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletTypeName, chainId, account])

	useEffect(() => {
		if (!!error) {
			setSnackbarErr(getErrorMessage(error))
			setOpenErr(true)
			if (error instanceof UnsupportedChainIdError) {
				setChainWarning(true)
			}
			// deactivate()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error])

	const wrapDoingTxns = useCallback(
		fn => async (...args) => {
			try {
				setOpenDoingTx(true)
				setOpenErr(false)
				const res = await fn.apply(null, args)
				setOpenDoingTx(false)
				refreshStats()
				return res
			} catch (e) {
				console.error(e)
				setOpenDoingTx(false)
				setSnackbarErr(
					e.values
						? {
								msg: e.message || "errors.unknownError",
								opts: e.values || {}
						  }
						: e.message || "errors.unknownError"
				)
				setOpenErr(true)
			}
		},
		[refreshStats]
	)

	const onRequestUnbond = useCallback(
		wrapDoingTxns(onUnbondOrRequest.bind(null, false, chosenWalletType)),
		[chosenWalletType]
	)

	const onUnbond = useCallback(
		wrapDoingTxns(onUnbondOrRequest.bind(null, true, chosenWalletType)),
		[chosenWalletType]
	)

	const onMigrationFinalize = useCallback(
		wrapDoingTxns(onMigrationToV5Finalize.bind(null, chosenWalletType)),
		[chosenWalletType]
	)

	const onRebond = useCallback(
		wrapDoingTxns(reBond.bind(null, chosenWalletType)),
		[ChooseWallet]
	)

	const onClaimRewards = useCallback(
		wrapDoingTxns(claimRewards.bind(null, chosenWalletType)),
		[chosenWalletType]
	)

	const handleErrClose = useCallback(
		(event, reason) => {
			if (reason === "clickaway") {
				return
			}
			setOpenErr(false)
		},
		[setOpenErr]
	)

	const onConnectionDisconnect = useCallback(
		async walletTypeName => {
			console.log(`Deactivating - ${chosenWalletTypeName} `)
			setChosenWalletTypeName(null)
			setConnectWallet(null)
			try {
				await deactivate()
				// NOTE: just in case because sometimes deactivate() with walletconnect does not
				// disconnects because of some uncaught promise err on  .walletConnectProvider.disconnect()
				if (chosenWalletTypeName === WALLET_CONNECT) {
					removeFromLocalStorage("walletconnect")
					removeFromLocalStorage("WALLETCONNECT_DEEPLINK_CHOICE")
					removeFromLocalStorage("wc1_state")
				}
			} catch (err) {
				console.error({ err })
			}
		},
		[chosenWalletTypeName, deactivate]
	)

	const onWalletTypeSelect = useCallback(async walletTypeName => {
		async function onChange() {
			setConnectWallet(null)
			const newConnector = connectorsByName[walletTypeName]

			if (!newConnector) {
				console.error(
					"onWalletTypeSelect",
					"invalid connector",
					`walletTypeName: ${chosenWalletTypeName}`
				)
				setSnackbarErr({
					msg: "errors.invalidWalletTypeName",
					opts: { walletTypeName: chosenWalletTypeName }
				})
				setOpenErr(true)
				setChosenWalletTypeName(null)
			} else {
				try {
					if (walletTypeName === GNOSIS_SAFE) {
						const gnosis = newConnector({
							startActivation: () => activate(GNOSIS_SAFE),
							update: () => activate(GNOSIS_SAFE)
						})
						await gnosis.connectEagerly()
						setChosenWalletTypeName(walletTypeName)
					} else {
						await activate(newConnector, () => {}, true)
						setChosenWalletTypeName(walletTypeName)
					}
				} catch (err) {
					console.log("ERR", err)
					setSnackbarErr({
						msg: getErrorMessage(err),
						opts: { walletTypeName: chosenWalletTypeName }
					})
					setOpenErr(true)
					if (err instanceof UnsupportedChainIdError) {
						console.log("wrong chain")
						setChainWarning(true)
					}
					await deactivate()
					setChosenWalletTypeName(null)
				}
			}
		}

		onChange()
	}, [])

	useEffect(() => {
		async function updateWallet() {
			if (!chosenWalletTypeName) {
				setChosenWalletType({})
			} else {
				const signerAddr = await (await library?.getSigner())?.getAddress()
				const newWalletType = signerAddr
					? { name: chosenWalletTypeName, library, account: signerAddr }
					: {}
				setChosenWalletType(newWalletType)
			}
		}

		updateWallet()
	}, [chosenWalletTypeName])

	return {
		isNewBondOpen,
		setNewBondOpen,
		toUnbond,
		setToUnbond,
		onRebond,
		onMigrationFinalize,
		openErr,
		setOpenErr,
		openDoingTx,
		setOpenDoingTx,
		snackbarErr,
		setSnackbarErr,
		stats,
		connectWallet,
		setConnectWallet,
		chosenWalletType,
		refreshStats,
		wrapDoingTxns,
		onRequestUnbond,
		onUnbond,
		onClaimRewards,
		handleErrClose,
		getSigner,
		prices,
		onWalletTypeSelect,
		onConnectionDisconnect,
		addSnack,
		snackHooks,
		chainId,
		account,
		chainWarning,
		newBondPool,
		setNewBondPool,
		legacySwapInPrg,
		setLegacySwapInPrg,
		legacySwapOpen,
		setLegacySwapInOpen,
		idlePopupOpen,
		onIdleDialogAction,
		userIdle,
		updatingStats
	}
}
