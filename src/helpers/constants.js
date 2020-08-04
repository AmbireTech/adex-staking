import { bigNumberify, id } from "ethers/utils"

export const ADDR_STAKING = "0x4846c6837ec670bbd1f5b485471c8f64ecb9c534"
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
			'The "Validator Tom" pool will distribute its fee earnings proportionally to each staker. The fee earnings will be 7% of the total volume, which you can track on our Explorer.',
		slashPolicy: "No slashing.",
		url: "https://tom.adex.network",
		estimatedAnnualFeeYield: 182500,
		estimatedAnnualADXYield: 15103448.2758,
		estimatedAnnualADXEarlyYield: 12166666.6666
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

export const TOKEN_OLD_TO_NEW_MULTIPLIER = bigNumberify("100000000000000")
