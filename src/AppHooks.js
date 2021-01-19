import { useEffect, useState, useCallback } from "react"
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core"
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
	SUPPORTED_CHAINS,
	IDLE_TIMEOUT_MINUTES
} from "./helpers/constants"
import { injected, trezor, ledger, walletconnect } from "./helpers/connector"
import {
	EMPTY_STATS,
	loadStats,
	onUnbondOrRequest,
	claimRewards,
	restake,
	getPrices,
	reBond
} from "./actions"
import { useInactiveListener } from "./helpers/hooks"
import { useSnack } from "./Snack"

const REFRESH_INTVL = 300_000 // 300sec
const REFRESH_INTVL_WALLET = 60_000 // 60sec
const IDLE_TIMEOUT = IDLE_TIMEOUT_MINUTES * 60 * 1000

const connectorsByName = {
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
		chainId,
		account
	} = useWeb3React()

	const [isNewBondOpen, setNewBondOpen] = useState(false)
	const [toUnbond, setToUnbond] = useState(null)
	const [toRestake, setToRestake] = useState(null)
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

	useInactiveListener(!!connectWallet)

	const handleOnIdle = () => {
		setUserIdle(true)
		setIdlePopupOpen(true)
	}

	const onIdleDialogAction = () => {
		setIdlePopupOpen(false)
		setUserIdle(false)
	}

	useIdleTimer({
		timeout: IDLE_TIMEOUT,
		onIdle: handleOnIdle,
		debounce: 500
	})

	const refreshStats = useCallback(async () => {
		if (userIdle) return

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userIdle, chosenWalletType, refreshCount, prices])

	useEffect(() => {
		refreshStats()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType])

	useEffect(() => {
		const intvl = setInterval(
			refreshStats,
			chosenWalletType.name ? REFRESH_INTVL_WALLET : REFRESH_INTVL
		)
		return () => clearInterval(intvl)
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			deactivate()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error])

	const wrapDoingTxns = fn => async (...args) => {
		try {
			setOpenDoingTx(true)
			setOpenErr(false)
			const res = await fn.apply(null, args)
			setOpenDoingTx(false)
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
	}
	const onRequestUnbond = wrapDoingTxns(
		onUnbondOrRequest.bind(null, false, chosenWalletType)
	)
	const onUnbond = wrapDoingTxns(
		onUnbondOrRequest.bind(null, true, chosenWalletType)
	)
	const onRebond = wrapDoingTxns(reBond.bind(null, chosenWalletType))
	const onClaimRewards = wrapDoingTxns(
		claimRewards.bind(null, chosenWalletType)
	)
	const onRestake = wrapDoingTxns(restake.bind(null, chosenWalletType, stats))
	const handleErrClose = (event, reason) => {
		if (reason === "clickaway") {
			return
		}
		setOpenErr(false)
	}

	const onWalletTypeSelect = async walletTypeName => {
		setChosenWalletTypeName(walletTypeName)
		setConnectWallet(null)
		console.log("activating")
		await activate(connectorsByName[walletTypeName])
	}

	useEffect(() => {
		async function updateWalletType() {
			if (library && chosenWalletTypeName) {
				const newWalletType = { name: chosenWalletTypeName, library }
				const signer = await getSigner(newWalletType)

				if (signer) {
					setChosenWalletType(newWalletType)
				}
			}
		}

		updateWalletType()
	}, [library, chosenWalletTypeName])

	return {
		isNewBondOpen,
		setNewBondOpen,
		toUnbond,
		setToUnbond,
		onRebond,
		toRestake,
		setToRestake,
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
		onRestake,
		handleErrClose,
		getSigner,
		prices,
		onWalletTypeSelect,
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
		userIdle
	}
}
