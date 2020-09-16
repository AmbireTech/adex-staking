import React, { useEffect, useState } from "react"
import { Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"

export function useSnack() {
	const [snackPack, setSnackPack] = useState([])
	const [snackOpen, setOpen] = useState(false)
	const [snackMessageInfo, setMessageInfo] = useState(undefined)

	useEffect(() => {
		if (snackPack.length && !snackMessageInfo) {
			// Set a new snack when we don't have an active one
			setMessageInfo({ ...snackPack[0] })
			setSnackPack(prev => prev.slice(1))
			setOpen(true)
		} else if (snackPack.length && snackMessageInfo && snackOpen) {
			// Close an active snack when a new one is added
			setOpen(false)
		}
	}, [snackPack, snackMessageInfo, snackOpen])

	const addSnack = (message, severity, hideTimeout) => {
		console.log("message", message)
		setSnackPack(prev => [
			...prev,
			{
				message,
				severity,
				hideTimeout,
				key: new Date().getTime() + "-" + Math.random()
			}
		])
	}

	const closeSnack = (event, reason) => {
		if (reason === "clickaway") {
			return
		}
		setOpen(false)
	}

	const snackExited = () => {
		setMessageInfo(undefined)
	}

	return {
		snackOpen,
		snackMessageInfo,
		addSnack,
		closeSnack,
		snackExited
	}
}

export function StarvolinkiSnack({
	snackOpen,
	snackMessageInfo = {},
	closeSnack,
	snackExited
}) {
	return (
		<Snackbar
			key={snackMessageInfo.key}
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "center"
			}}
			open={snackOpen}
			autoHideDuration={snackMessageInfo.hideTimeout || 20000}
			onExited={snackExited}
			onClose={closeSnack}
		>
			<Alert
				onClose={closeSnack}
				severity={snackMessageInfo.severity || "info"}
				variant="filled"
			>
				{snackMessageInfo.message}
			</Alert>
		</Snackbar>
	)
}
