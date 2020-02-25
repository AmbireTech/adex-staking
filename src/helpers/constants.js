import { bigNumberify, id } from "ethers/utils"

export const ADDR_STAKING = "0x46ad2d37ceaee1e82b70b867e674b903a4b4ca32"
export const ZERO = bigNumberify(0)
export const PRICES_API_URL =
	"https://min-api.cryptocompare.com/data/price?fsym=ADX&tsyms=BTC,USD,EUR"
export const ADX_MULTIPLIER = 10000
export const UNBOND_DAYS = 30
export const STAKING_RULES_URL = null

export const DEFAULT_BOND = {
	poolId: "",
	amount: ZERO
}

export const POOLS = [
	{
		label: "Validator Tom",
		id: id("validator:0x2892f6C41E0718eeeDd49D98D648C789668cA67d"),
		selectable: true,
		minStakingAmount: 0,
		rewardPolicy:
			'The "Validator Tom" pool will distribute its fee earnings proportionally to each staker. The fee earnings will be 5% of the total volume, which you can track on our Explorer.',
		slashPolicy: "No slashing.",
		url: "https://tom.adex.network"
	},
	{
		label: "Validator Jerry",
		id: id("validator:0xce07CbB7e054514D590a0262C93070D838bFBA2e"),
		selectable: false,
		minStakingAmount: 0,
		rewardPolicy: "",
		slashPolicy: ""
	}
]
