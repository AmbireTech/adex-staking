import { formatUnits, parseUnits } from "ethers/utils"

export function formatADX(num) {
	return formatUnits(num, 18)
}

export function formatADXPretty(num) {
	return formatUnits(num.div("100000000000000"), 4)
}

export function formatDAI(num) {
	return formatUnits(num, 18)
}

export function formatDAIPretty(num) {
	return formatUnits(num.div("10000000000000000"), 2)
}

export function parseADX(n) {
	return parseUnits(n, 18)
}

export function formatDate(d) {
	return `${d.getDate()} ${d.toLocaleString("default", {
		month: "short"
	})} ${d.getFullYear()}`
}

// @TODO refactor to take pool arguments and use pool constants
export function getApproxAPY(bond, totalStake, isEarly) {
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
