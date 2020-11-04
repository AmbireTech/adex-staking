export const hexToRgbaColorString = (hex, alpha) => {
	if (!hex || typeof hex !== "string") {
		throw new Error("Invalid color")
	} else if (hex.length === 4) {
		hex = hex + hex.substr(1, 4)
	}

	if (typeof alpha === "object" || typeof alpha === "undefined") {
		alpha = 1
	}

	const hexToDec = h => {
		return parseInt("0x" + h, 16)
	}

	let r = hexToDec(hex.substr(1, 2))
	let g = hexToDec(hex.substr(3, 2))
	let b = hexToDec(hex.substr(5, 2))

	return `rgba(${r},${g},${b},${alpha})`
}
