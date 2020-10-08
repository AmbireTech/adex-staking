import { stringify } from "query-string"

const MAUTIC_BASE_URL = `https://mautic.adex.net`

export const submitFormToMautic = async ({
	email,
	formId,
	returnValue,
	formName,
	messenger
}) => {
	const data = stringify({
		"mauticform[email]": email,
		"mauticform[formId]": formId || "",
		"mauticform[return]": returnValue || "",
		"mauticform[formName]": formName || "",
		"mauticform[messenger]": messenger || true
	})
	const response = await fetch(
		`${MAUTIC_BASE_URL}/form/submit?formId=${formId}`,
		{
			method: "POST",
			body: data,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				"X-Requested-With": "XMLHttpRequest"
			}
		}
	)
	const utf8Decoder = new TextDecoder("utf-8")
	const reader = response.body.getReader()
	let { value: mauticDataResponse } = await reader.read()
	mauticDataResponse = mauticDataResponse
		? utf8Decoder.decode(mauticDataResponse)
		: ""
	return mauticDataResponse
}

export const extractJSONResponseFromHTML = async mauticDataResponse => {
	const regex = /parent.postMessage\("(.+)".+\)/gm
	const matches = regex.exec(mauticDataResponse)
	if (matches && matches.length >= 1) {
		const message = matches[1]
		let messageCopy = message
		const asciiRegex = /\\.../gm
		let m
		while ((m = asciiRegex.exec(message)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === asciiRegex.lastIndex) {
				asciiRegex.lastIndex++
			}

			// The result can be accessed through the `m`-variable.
			/*eslint no-loop-func: "off"*/
			m.forEach((match, groupIndex) => {
				const decoded = String.fromCharCode(match.replace("\\", 0))
				messageCopy = messageCopy.split(match).join(decoded)
			})
		}
		// not able to JSON parse directly so I had to do this above ↑
		return JSON.parse(messageCopy)
	} else {
		console.warn(`No matches found:`, mauticDataResponse)
		return {}
	}
}
