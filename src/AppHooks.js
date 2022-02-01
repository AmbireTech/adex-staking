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
	SUPPORTED_CHAINS,
	IDLE_TIMEOUT_MINUTES
} from "./helpers/constants"
import { injected, trezor, ledger, walletconnect } from "./helpers/connector"
import {
	EMPTY_STATS,
	loadStats,
	onUnbondOrRequest,
	claimRewards,
	getPrices,
	reBond,
	onMigrationToV5Finalize
} from "./actions"
import { useInactiveListener } from "./helpers/hooks"
import { useSnack } from "./Snack"
import ChooseWallet from "components/ChooseWallet"

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

	const [web3ReactRoot, setWeb3ReactRoot] = useState(PRIMARY_KEY)

	const {
		library,
		activate,
		error,
		deactivate,
		chainId,
		account,
		connector
	} = useWeb3React(web3ReactRoot)

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

	useInactiveListener(!!connectWallet)

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

	const refreshStats = useCallback(async () => {
		setUpdatingStats(!!chosenWalletType.name && !!account)
		if (!chosenWalletType.name) {
			setStats(EMPTY_STATS)
		}

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

		setUpdatingStats(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userIdle, chosenWalletType.name, account, refreshCount, prices])

	useEffect(() => {
		refreshStats()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType.name, account])

	useEffect(() => {
		// const refreshInterval = chosenWalletType.name
		// 	? REFRESH_INTVL_WALLET
		// 	: REFRESH_INTVL
		let intvl = setInterval(refreshStats, REFRESH_INTVL_WALLET)

		return () => {
			clearInterval(intvl)
			intvl = null
		}
	}, [refreshStats])

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
			console.log("deactivate on error")
			deactivate()
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

	const onWalletConnectionsDeactivate = useCallback(
		async walletTypeName => {
			console.log(`Deactivating - ${chosenWalletTypeName} `)
			deactivate()
		},
		[chosenWalletTypeName, deactivate]
	)

	const onWalletTypeSelect = useCallback(async walletTypeName => {
		setConnectWallet(null)

		if (walletTypeName === WALLET_CONNECT) {
			setWeb3ReactRoot(WALLET_CONNECT)
		} else {
			setWeb3ReactRoot(PRIMARY_KEY)
		}

		// if (walletTypeName === null) {
		// 	setChosenWalletTypeName(walletTypeName)
		// 	return
		// }

		// const newConnector = connectorsByName[walletTypeName]

		// if (!newConnector) {
		// 	console.error(
		// 		"onWalletTypeSelect",
		// 		"invalid connector",
		// 		`walletTypeName: ${walletTypeName}`
		// 	)
		// 	setSnackbarErr({
		// 		msg: "errors.invalidWalletTypeName",
		// 		opts: { walletTypeName }
		// 	})
		// 	setOpenErr(true)
		// }

		// // console.log('connector', connector)

		// console.log('account', account)
		// console.log('connector', connector)

		// await activate(newConnector, (err) => console.log('ERRRRROR', err), true)
		setChosenWalletTypeName(walletTypeName)
	}, [])

	useEffect(() => {
		async function updateWalletType() {
			if (!chosenWalletTypeName) {
				setChosenWalletType({})
				return
			}
			const newConnector = connectorsByName[chosenWalletTypeName]

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
			}

			await activate(newConnector, err => console.log("ERRRRROR", err), true)
			// setChosenWalletTypeName(chosenWalletTypeName)

			if (library && chosenWalletTypeName) {
				const newWalletType = { name: chosenWalletTypeName, library }
				const signer = await getSigner(newWalletType)

				if (signer) {
					setChosenWalletType(newWalletType)
				} else {
					setChosenWalletType({})
				}
			} else {
				setChosenWalletType({})
			}
		}

		updateWalletType()
	}, [library, chosenWalletTypeName, connector, activate])

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
		onWalletConnectionsDeactivate,
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
