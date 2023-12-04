"use client"
import { useEffect, useState } from "react"

const useEmailSubscription = () => {
	const [errorMessage, setErrorMessage] = useState("")
	const [successMessage, setSuccessMessage] = useState("")
	const [email, setEmail] = useState("")
	const [waiting, setWaiting] = useState(false)

	const submitForm = e => {
		e.preventDefault()
		setErrorMessage("")
		setSuccessMessage("")
		const data = JSON.stringify({ email, campaignId: "Z8Nmu" })
		const url = "https://relayer.ambire.com/email-list/add"
		setWaiting(true)

		fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: data
		})
			.then(async res => {
				const data = await res.json()
				if (data.success) {
					setSuccessMessage(data.message)
					setEmail("")
				} else if (data.data === "Conflict") {
					setErrorMessage(
						"Looks like you're already on the list! 🎉 We'll keep you posted."
					)
				} else if (data.message === '"body.email" must be a valid email') {
					setErrorMessage(
						"Hmm, that doesn't look like a valid email address. 🤔 Can you double-check it?"
					)
				} else {
					setErrorMessage(
						"Oops! 🙈 We encountered an unexpected issue. Please try again."
					)
				}
			})
			.catch(err => {
				setErrorMessage(err && err.message)
			})
			.finally(() => {
				setWaiting(false)
			})
	}

	useEffect(() => {
		let timer

		if (errorMessage || successMessage) {
			timer = setTimeout(() => {
				setErrorMessage("")
				setSuccessMessage("")
			}, 8000)
		}

		return () => {
			clearTimeout(timer)
		}
	}, [errorMessage, successMessage])

	return {
		errorMessage,
		successMessage,
		email,
		setEmail,
		submitForm,
		waiting
	}
}

export default useEmailSubscription
