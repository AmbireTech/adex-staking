import { formatUnits, parseUnits, commify, bigNumberify } from "ethers/utils"

export function formatADX(num) {
	return formatUnits(num, 18)
}

export function formatADXPretty(num) {
	return commify(formatUnits(num.div("100000000000000"), 4))
}

export function formatNumberPretty(num) {
	return commify(num)
}

export function formatDAI(num) {
	return formatUnits(num, 18)
}

export function formatDAIPretty(num) {
	return commify(formatUnits(num.div("10000000000000000"), 2))
}

export function formatAmountPretty(num, currency) {
	if (!num) {
		return num
	}

	switch (currency) {
		case "DAI":
			return formatDAIPretty(bigNumberify(num))
		case "ADX":
			return formatADXPretty(bigNumberify(num))
		default:
			return num.toLocaleString(10)
	}
}

export function parseADX(n) {
	return parseUnits(n, 18)
}

export function parseTokens(n, decimals = 18) {
	return parseUnits(n, 18)
}

export function formatTokens(n, decimals = 18) {
	return formatUnits(n, decimals)
}

export function formatDate(d) {
	return `${d.getDate()} ${d.toLocaleString("default", {
		month: "short"
	})} ${d.getFullYear()}`
}

// @TODO refactor to take pool arguments and use pool constants
export function getApproxAPY(bond, totalStake, isEarly) {
	if (!totalStake || totalStake.isZero()) return 0
	const earlyDistributionEnds = 1599177600000
	const bondCreatedSeconds =
		bond && bond.nonce ? bond.nonce.toNumber() : Date.now() / 1000
	const getsEarlyBird =
		(isEarly || bondCreatedSeconds < 1597276800) &&
		Date.now() < earlyDistributionEnds
	// this reward is distributed over that many days, hence * (365/145)
	const base = (6000000 / parseFloat(formatADX(totalStake), 10)) * (365 / 145)
	const early = (1000000 / parseFloat(formatADX(totalStake), 10)) * (365 / 30)
	return base + (getsEarlyBird ? early : 0)
	// @TODO DAI rewards
}

export function getADXInUSD(prices, ADX) {
	if (!prices || !prices.USD) return 0
	const adxUsd = parseFloat(formatADX(ADX || 0), 10) * prices.USD
	return adxUsd
}

export function getADXInUSDFormatted(prices, ADX) {
	const adxUsd = getADXInUSD(prices, ADX)
	return `$ ${commify(adxUsd.toFixed(2))}`
}

export function getDAIInUSD(DAI) {
	const adxUsd = parseFloat(formatDAI(DAI || 0), 10) * 1
	return adxUsd
}

export function getUSDFormatted(usdAmount) {
	return `$ ${commify(parseFloat(usdAmount.toFixed(2)))}`
}

export const formatAddress = (address = "", joinSymbol = "...") => {
	return `${address.substring(0, 6)}${joinSymbol}${address.substring(38, 42)}`
}

export const toIdAttributeString = (string, defaultValue) => {
	if (typeof string === "string") {
		return string.replace(/([^a-z0-9]+)/gi, "-").toLowerCase()
	} else {
		return defaultValue || ""
	}
}
