import { formatUnits, parseUnits, bigNumberify } from "ethers/utils"

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

// @TODO refactor to take pool arguments and use pool constants
export function getApproxAPY(bond, totalStake) {
	const earlyDistributionEnds = 1609372800000
	const bondCreatedSeconds =
		bond && bond.nonce ? bond.nonce.toNumber() : Date.now() / 1000
	const isEarly =
		bondCreatedSeconds < 1597276800 && Date.now() < earlyDistributionEnds
	// @TODO use ADX multiplier
	// this reward is distributed over that many days, hence * (365/145)
	const base =
		(6000000 / totalStake.div(bigNumberify("1000000000000000000")).toNumber()) *
		(365 / 145)
	const early =
		(1000000 / totalStake.div(bigNumberify("1000000000000000000")).toNumber()) *
		(365 / 30)
	return base + (isEarly ? early : 0)
	// @TODO DAI rewards
}
