import React, { useCallback, useEffect, useState } from "react"
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

	const addSnack = useCallback(
		(message, severity, hideTimeout = 20000, action) => {
			setSnackPack(prev => [
				...prev,
				{
					message,
					severity,
					hideTimeout,
					action,
					key: new Date().getTime() + "-" + Math.random()
				}
			])
		},
		[]
	)

	const closeSnack = (event, reason) => {
		if (reason === "clickaway") {
			return
		}
		setMessageInfo(undefined)
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

export function ShtarvolinkiSnack({
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
			autoHideDuration={snackMessageInfo.hideTimeout}
			// onExited={snackExited}
			onClose={closeSnack}
		>
			<Alert
				onClose={closeSnack}
				severity={snackMessageInfo.severity || "info"}
				variant="filled"
				action={snackMessageInfo.action || null}
			>
				{snackMessageInfo.message}
			</Alert>
		</Snackbar>
	)
}
