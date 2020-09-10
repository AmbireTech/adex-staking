import { useEffect, useState } from "react"
import { getSigner } from "./ethereum"
import {
	EMPTY_STATS,
	loadStats,
	onUnbondOrRequest,
	claimRewards,
	restake
} from "./actions"

const REFRESH_INTVL = 20000

export default function Root() {
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
	const [chosenWalletType, setChosenWalletType] = useState(null)

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

	useEffect(() => {
		refreshStats()
		const intvl = setInterval(refreshStats, REFRESH_INTVL)
		return () => clearInterval(intvl)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWalletType])

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
		setChosenWalletType,
		refreshStats,
		wrapDoingTxns,
		onRequestUnbond,
		onUnbond,
		onClaimRewards,
		onRestake,
		handleErrClose,
		getSigner
	}
}
