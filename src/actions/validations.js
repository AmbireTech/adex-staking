export function isValidNumberString(numStr) {
	if (typeof numStr !== "string") return false
	return !isNaN(numStr) && !isNaN(parseFloat(numStr))
}
