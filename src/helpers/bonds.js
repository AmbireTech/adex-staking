import { POOLS, ADDR_STAKING } from "./constants"
import { utils } from "ethers"

const { keccak256, defaultAbiCoder } = utils

export const getPool = poolId => POOLS.find(x => x.id === poolId)
export function getBondId({ owner, amount, poolId, nonce }) {
	return keccak256(
		defaultAbiCoder.encode(
			["address", "address", "uint", "bytes32", "uint"],
			[ADDR_STAKING, owner, amount, poolId, nonce]
		)
	)
}
