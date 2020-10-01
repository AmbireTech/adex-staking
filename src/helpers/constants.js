import { bigNumberify, id } from "ethers/utils"
import walletconnectLogo from "../walletconnect-logo.svg"
import metamaskLogo from "../metamask-fox.svg"
// import trezorLogo from "../trezor.svg"
// import ledgerLogo from "../ledger.png"

export const ADDR_STAKING = "0x4846c6837ec670bbd1f5b485471c8f64ecb9c534"
export const ZERO = bigNumberify(0)
export const PRICES_API_URL =
	"https://min-api.cryptocompare.com/data/price?fsym=ADX&tsyms=BTC,USD,EUR"
export const UNBOND_DAYS = 30
export const STAKING_RULES_URL = null

export const ADDR_ADX = "0xADE00C28244d5CE17D72E40330B1c318cD12B7c3"
export const ADDR_FACTORY = "0x9fe0d438e3c29c7cff949ad8e8da9403a531cc1a"
export const ADDR_ADX_LOYALTY_TOKEN =
	"0x49ee1555672E1b7928Fc581810B4e79dD85263E1"

export const MAX_UINT = bigNumberify(
	"115792089237316195423570985008687907853269984665640564039457584007913129639935"
)

export const MIN_BALANCE_FOR_GASLESS_TXNS = bigNumberify(
	"20000000000000000000000"
) // 20 000 ADX

export const DEFAULT_BOND = {
	poolId: "",
	amount: ZERO
}

export const POOLS = [
	{
		label: "Validator Tom",
		id: id("validator:0x2892f6C41E0718eeeDd49D98D648C789668cA67d"),
		selectable: true,
		minStakingAmount: "0.0",
		rewardPolicy:
			'The "Validator Tom" pool will distribute its fee earnings proportionally to each staker. The fee earnings will be 7% of the total volume, which you can track on our Explorer. There is an additional incentive reward of 7 million ADX to be distributed by the end of 2020.',
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

export const METAMASK = "Metamask"
export const WALLET_CONNECT = "WalletConnect"
export const TREZOR = "Trezor"
export const LEDGER = "Ledger"

export const Wallets = [
	{
		title: `Connect with ${METAMASK}`,
		name: METAMASK,
		icon: metamaskLogo
	},
	{
		title: `Connect with ${WALLET_CONNECT}`,
		name: WALLET_CONNECT,
		icon: walletconnectLogo
	}
	// {
	// 	title: `Connect with ${TREZOR}`,
	// 	name: TREZOR,
	// 	icon: trezorLogo
	// },
	// {
	// 	title: `Connect with ${LEDGER}`,
	// 	name: LEDGER,
	// 	icon: ledgerLogo
	// }
]

export const SUPPORTED_CHAINS = [{ id: 1, name: "mainnet" }]

export const TOKEN_OLD_TO_NEW_MULTIPLIER = bigNumberify("100000000000000")

export const REACT_APP_INFURA_ID = "3d22938fd7dd41b7af4197752f83e8a1"

export const REACT_APP_RPC_URL =
	"https://mainnet.infura.io/v3/3d22938fd7dd41b7af4197752f83e8a1"

export const ADEX_RELAYER_HOST = "https://relayer.adex.network"
