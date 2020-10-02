import { DEPOSIT_POOLS } from "../helpers/constants"
import { onLoyaltyPoolDeposit } from "./loyaltyPoolActions"

export const getDepositPool = poolId => DEPOSIT_POOLS.find(x => x.id === poolId)

export const getDepositActionByPoolId = poolId => {
	if (poolId === DEPOSIT_POOLS[0].id) {
		return onLoyaltyPoolDeposit
	}
}
