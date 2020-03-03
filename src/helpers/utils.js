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
	return (num.toNumber(10) / ADX_MULTIPLIER).toFixed(2)
}

export function formatDAI(num) {
	return (
		num.div(bigNumberify("10000000000000000")).toNumber(10) / 100
	).toFixed(2)
}
