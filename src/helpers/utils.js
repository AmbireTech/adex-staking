import { POOLS, ADDR_STAKING, ADX_MULTIPLIER } from "./constants"
import { keccak256, defaultAbiCoder, bigNumberify } from "ethers/utils"

export const getPool = poolId => POOLS.find(x => x.id === poolId)
export function getBondId({ owner, amount, poolId, nonce }) {
	return keccak256(
		defaultAbiCoder.encode(
			["address", "address", "uint", "bytes32", "uint"],
			[ADDR_STAKING, owner, amount, poolId, nonce]
		)
	)
}

export function formatADX(num) {
	// @TODO fix this dirty hack?
	return (num.div(100000000000000).toNumber(10) / ADX_MULTIPLIER).toFixed(4)
}

// @TODO fix this dirty hack?
export function formatADXLegacy(num) {
	return (num.toNumber(10) / ADX_MULTIPLIER).toFixed(4)
}

export function formatDAI(num) {
	return (
		num.div(bigNumberify("10000000000000000")).toNumber(10) / 100
	).toFixed(2)
}

// @TODO refactor to take pool arguments and use pool constants
export function getApproxAPY(bond, totalStake) {
	const earlyDistributionEnds = 1597190400000
	const bondCreatedSeconds =
		bond && bond.time ? bond.time.toNumber() : Date.now() / 1000
	const isEarly =
		bondCreatedSeconds < 1597190400 && Date.now() < earlyDistributionEnds
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
