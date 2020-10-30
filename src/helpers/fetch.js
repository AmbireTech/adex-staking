export async function fetchJSON(url, opts) {
	const resp = await fetch(url, opts)
	return resp.json()
}

export async function postJSON(url, body) {
	return fetchJSON(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	})
}
