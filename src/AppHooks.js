import { useEffect, useState, useCallback } from "react"
import {
	Web3ReactProvider,
	useWeb3React,
	UnsupportedChainIdError
} from "@web3-react/core"
import {
	NoEthereumProviderError,
	UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector"

import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector"
import { getSigner } from "./ethereum"
import {
	PRICES_API_URL,
	WALLET_CONNECT,
	METAMASK,
	TREZOR,
	LEDGER
} from "./helpers/constants"
import {
	injected,
	trezor,
	ledger,
	walletconnect,
	REACT_APP_RPC_URL
} from "./helpers/connector"
import {
	EMPTY_STATS,
	loadStats,
	onUnbondOrRequest,
	claimRewards,
	restake
} from "./actions"
import { useInactiveListener } from "./helpers/hooks"

const REFRESH_INTVL = 20000

const connectorsByName = {
	[METAMASK]: injected,
	[WALLET_CONNECT]: walletconnect,
	[TREZOR]: trezor,
	[LEDGER]: ledger
}

function getErrorMessage(error) {
	if (error instanceof NoEthereumProviderError) {
		return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile."
	} else if (error instanceof UnsupportedChainIdError) {
		return "You're connected to an unsupported network."
	} else if (
		error instanceof UserRejectedRequestErrorInjected ||
		error instanceof UserRejectedRequestErrorWalletConnect
	) {
		return "Please authorize this website to access your Ethereum account."
	} else {
		console.error(error)
		return "An unknown error occurred. Check the console for more details."
	}
}

export default function Root() {
	const { library, activate, error, deactivate } = useWeb3React()

	const [isNewBondOpen, setNewBondOpen] = useState(false)
	const [toUnbond, setToUnbond] = useState(null)
	const [toRestake, setToRestake] = useState(null)
	const [openErr, setOpenErr] = useState(false)
	const [openDoingTx, setOpenDoingTx] = useState(false)
	const [snackbarErr, setSnackbarErr] = useState(
		"Error! Unspecified error occured."
	)
	const [stats, setStats] = useState(EMPTY_STATS)
	const [connectWallet, setConnectWallet] = useState(null)
	const [chosenWalletTypeName, setChosenWalletTypeName] = useState(null)
	const [chosenWalletType, setChosenWalletType] = useState({})
	const [prices, setPrices] = useState({})

	useInactiveListener(!!connectWallet)

	const refreshStats = () =>
		loadStats(chosenWalletType)
			.then(setStats)
			.catch(e => {
				console.error("loadStats", e)
				setOpenErr(true)
				if (e.code === 4001) {
					setSnackbarErr("Error! User denied authorization!")
				}
			})

	const refreshPrices = () =>
		fetch(PRICES_API_URL)
			.then(r => r.json())
			.then(setPrices)
			.catch(console.error)

	useEffect(() => {
		if (chosenWalletType.name && chosenWalletType.library) {
			refreshStats()
			refreshPrices()
			const intvl = setInterval(refreshStats, REFRESH_INTVL)
			return () => clearInterval(intvl)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType])

	useEffect(() => {
		setChosenWalletType({ name: chosenWalletTypeName, library })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletTypeName, library])

	useEffect(() => {
		if (!!error) {
			setOpenErr(true)
			setSnackbarErr(getErrorMessage(error))
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
			setOpenErr(true)
			setSnackbarErr(e.message || "Unknown error")
		}
	}
	const onRequestUnbond = wrapDoingTxns(
		onUnbondOrRequest.bind(null, false, chosenWalletType)
	)
	const onUnbond = wrapDoingTxns(
		onUnbondOrRequest.bind(null, true, chosenWalletType)
	)
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
		await activate(connectorsByName[walletTypeName])
	}

	useEffect(() => {
		async function updateWalletType() {
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
	}, [library, chosenWalletTypeName])

	return {
		isNewBondOpen,
		setNewBondOpen,
		toUnbond,
		setToUnbond,
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
		onWalletTypeSelect
	}
}