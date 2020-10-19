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
	"0xd9A4cB9dc9296e111c66dFACAb8Be034EE2E1c2C"

export const MAX_UINT = bigNumberify(
	"115792089237316195423570985008687907853269984665640564039457584007913129639935"
)

export const MIN_BALANCE_FOR_GASLESS_TXNS = bigNumberify(
	"10000000000000000000000"
) // 10 000 ADX

export const DEFAULT_BOND = {
	poolId: "",
	amount: ZERO
}

export const POOLS = [
	{
		label: "common.validatorTom",
		id: id("validator:0x2892f6C41E0718eeeDd49D98D648C789668cA67d"),
		selectable: true,
		minStakingAmount: "0.0",
		rewardPolicy: "pools.tomRewardPolicy",
		slashPolicy: "pools.tomSlashPolicy",
		url: "https://tom.adex.network",
		estimatedAnnualFeeYield: 182500,
		estimatedAnnualADXYield: 15103448.2758,
		estimatedAnnualADXEarlyYield: 12166666.6666
	},
	{
		label: "common.validatorJerry",
		id: id("validator:0xce07CbB7e054514D590a0262C93070D838bFBA2e"),
		selectable: false,
		minStakingAmount: 0,
		rewardPolicy: "",
		slashPolicy: ""
	}
]

export const DEPOSIT_POOLS = [
	{
		label: "common.loPo",
		id: id("deposit:0x49ee1555672E1b7928Fc581810B4e79dD85263E1"),
		selectable: true,
		minStakingAmount: "0.0",
		rewardPolicy: "pools.loPoRewardPolicy",
		slashPolicy: "pools.loPoSlashPolicy",
		url:
			"https://etherscan.io/address/0x49ee1555672e1b7928fc581810b4e79dd85263e1",
		confirmationLabel: null,
		confirmationUrl: "https://www.adex.network/tos/"
	}
]

export const METAMASK = "Metamask"
export const WALLET_CONNECT = "WalletConnect"
export const TREZOR = "Trezor"
export const LEDGER = "Ledger"

export const Wallets = [
	{
		name: METAMASK,
		icon: metamaskLogo
	},
	{
		name: WALLET_CONNECT,
		icon: walletconnectLogo
	}
	// {
	// 	name: TREZOR,
	// 	icon: trezorLogo
	// },
	// {
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
