import { BigNumber, utils } from "ethers"
import walletconnectLogo from "../walletconnect-logo.svg"
import metamaskLogo from "../metamask-fox.svg"
// import trezorLogo from "../trezor.svg"
// import ledgerLogo from "../ledger.png"

import { ReactComponent as BalancerIcon } from "./../resources/balancer-bal-logo.svg"
import { ReactComponent as UniswapIcon } from "./../resources/uniswap-uni-logo.svg"
import { ReactComponent as YUSDIcon } from "./../resources/yUSD.svg"
import { ReactComponent as ADXIcon } from "./../resources/adex-logo-clean.svg"
import { ReactComponent as ETHIcon } from "./../resources/eth-logo.svg"
import { ReactComponent as YFIIcon } from "./../resources/yfi-logo.svg"
import { ReactComponent as LINKIcon } from "./../resources/chain-link-logo.svg"

export const ADDR_STAKING = "0x4846c6837ec670bbd1f5b485471c8f64ecb9c534"
export const ZERO = BigNumber.from(0)
// export const PRICES_API_URL =
// 	"https://min-api.cryptocompare.com/data/price?fsym=ADX&tsyms=BTC,USD,EUR"

export const PRICES_API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=ADEX&vs_currencies=usd`
export const UNBOND_DAYS = 30
export const STAKING_RULES_URL = null

export const IDLE_TIMEOUT_MINUTES = 10

export const ADDR_CORE = "0x333420fc6a897356e69b62417cd17ff012177d2b"
export const ADDR_ADX = "0xADE00C28244d5CE17D72E40330B1c318cD12B7c3"
export const ADDR_FACTORY = "0x9fe0d438e3c29c7cff949ad8e8da9403a531cc1a"
export const ADDR_ADX_LOYALTY_TOKEN =
	"0xd9A4cB9dc9296e111c66dFACAb8Be034EE2E1c2C"
export const DAI_TOKEN_ADDR = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

export const MAX_UINT = BigNumber.from(
	"115792089237316195423570985008687907853269984665640564039457584007913129639935"
)

export const MIN_BALANCE_FOR_GASLESS_TXNS = BigNumber.from(
	"10000000000000000000000"
) // 10 000 ADX

export const DEFAULT_BOND = {
	poolId: "",
	amount: ZERO
}

export const POOLS = [
	{
		label: "common.validatorTom",
		id: utils.id("validator:0x2892f6C41E0718eeeDd49D98D648C789668cA67d"),
		selectable: true,
		minStakingAmount: "0.0",
		purpose: "pools.tomPurpose",
		lockupPeriod: 30,
		lockupPeriodText: "pools.tomLockupPeriodTxt",
		rewardPolicy: "pools.tomRewardPolicy",
		slashPolicy: "pools.tomSlashPolicy",
		apyStability: "pools.tomApyStability",
		url: "https://tom.adex.network",
		estimatedAnnualFeeYield: 182500,
		estimatedAnnualADXYield: 15103448.2758,
		estimatedAnnualADXEarlyYield: 12166666.6666
	},
	{
		label: "common.validatorJerry",
		id: utils.id("validator:0xce07CbB7e054514D590a0262C93070D838bFBA2e"),
		selectable: false,
		minStakingAmount: 0,
		rewardPolicy: "",
		slashPolicy: ""
	}
]

export const DEPOSIT_POOLS = [
	{
		label: "common.loPo",
		id: utils.id("deposit:0x49ee1555672E1b7928Fc581810B4e79dD85263E1"),
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
		icon: walletconnectLogo,
		extraLabel: {
			message: "dialogs.exceptWallets",
			data: {
				wallets: "Trust Wallet"
			}
		}
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

export const TOKEN_OLD_TO_NEW_MULTIPLIER = BigNumber.from("100000000000000")

export const REACT_APP_INFURA_ID = "3d22938fd7dd41b7af4197752f83e8a1"

// export const REACT_APP_RPC_URL =
// 	"wss://mainnet.infura.io/ws/v3/3d22938fd7dd41b7af4197752f83e8a1"

export const REACT_APP_RPC_URL =
	"https://goerli.infura.io/v3/3d22938fd7dd41b7af4197752f83e8a1"

export const ADEX_RELAYER_HOST = "https://relayer.adex.network"
// export const ADEX_RELAYER_HOST = "https://goerli-relayer.adex.network"

export const FARM_POOLS = [
	// {
	// 	// GOERLI TST
	// 	poolId: 0,
	// 	name: "TST-ADX",
	// 	token: "TST-ADX",
	// 	platform: "Balancer",
	// 	depositAssetName: "TST-ADX",
	// 	depositAssetAddr: "0x7af963cF6D228E564e2A0aA0DdBF06210B38615D",
	// 	depositAssetDecimals: 18,
	// 	getDepositAssetUrl: "https://goerli-faucet.slock.it/",
	// 	lpTokenAddr: "0x2aecF52ABe359820c48986046959B4136AfDfbe2",
	// 	lpTokenData: [
	// 		{
	// 			token: "TST",
	// 			weight: 0.2,
	// 			addr: "0x7af963cF6D228E564e2A0aA0DdBF06210B38615D"
	// 		},
	// 		{
	// 			token: "ADX",
	// 			weight: 0.8,
	// 			addr: ADDR_ADX
	// 		}
	// 	],
	// 	rewardAssetName: "ADX",
	// 	rewardAssetAddr: ADDR_ADX,
	// 	platformIcon: BalancerIcon,
	// 	assetsIcons: [ADXIcon, YUSDIcon]
	// },
	// {
	// 	// GOERLI TST
	// 	poolId: 1,
	// 	name: "ADX-TST-2",
	// 	token: "ADX-TST-2",
	// 	platform: "Uniswap",
	// 	depositAssetName: "ADX-TST-2",
	// 	depositAssetAddr: ADDR_ADX,
	// 	depositAssetDecimals: 18,
	// 	getDepositAssetUrl: "https://goerli-faucet.slock.it/",
	// 	lpTokenAddr: "0x0A8fe6e91eaAb3758dF18f546f7364343667E957",
	// 	lpTokenData: [
	// 		{
	// 			token: "ADX",
	// 			weight: 0.83129,
	// 			addr: ADDR_ADX
	// 		},
	// 		{
	// 			token: "TST2",
	// 			weight: 1 - 0.83129,
	// 			addr: "0x7af963cF6D228E564e2A0aA0DdBF06210B38615D"
	// 		}
	// 	],
	// 	rewardAssetName: "ADX",
	// 	rewardAssetAddr: ADDR_ADX,
	// 	platformIcon: UniswapIcon,
	// 	assetsIcons: [ADXIcon, ADXIcon]
	// }

	// MAINNET
	{
		poolId: 0,
		name: "Uniswap ADX-ETH",
		token: "UNI-ADX-ETH",
		platform: "Uniswap",
		depositAssetName: "UNI-ADX-ETH",
		depositAssetAddr: "0xd3772a963790fede65646cfdae08734a17cd0f47",
		depositAssetDecimals: 18,
		getDepositAssetUrl:
			"https://info.uniswap.org/pair/0xd3772a963790fede65646cfdae08734a17cd0f47",
		lpTokenAddr: "0xd3772a963790fede65646cfdae08734a17cd0f47",
		lpTokenData: [
			{
				token: "ADX",
				weight: 0.5,
				decimals: 18,
				addr: "0xADE00C28244d5CE17D72E40330B1c318cD12B7c3"
			},
			{
				token: "ETH",
				weight: 0.5,
				decimals: 18,
				addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
			}
		],
		rewardAssetName: "ADX",
		rewardAssetAddr: ADDR_ADX,
		platformIcon: UniswapIcon,
		assetsIcons: [ADXIcon, ETHIcon],
		special: true,
		latRewardBlock: 11494773,
		rewardsDurationDays: 30
	},
	{
		poolId: 1,
		name: "Balancer ADX-yUSD",
		token: "BPT-ADX-yUSD",
		platform: "Balancer",
		depositAssetName: "BPT-ADX-yUSD",
		depositAssetAddr: "0x415900c6e18b89531e3e24c902b05c031c71a925",
		depositAssetDecimals: 18,
		getDepositAssetUrl:
			"https://pools.balancer.exchange/#/pool/0x415900c6e18b89531e3e24c902b05c031c71a925/",
		lpTokenAddr: "0x415900c6e18b89531e3e24c902b05c031c71a925",
		lpTokenData: [
			{
				token: "ADX",
				weight: 0.7,
				decimals: 18,
				addr: "0xADE00C28244d5CE17D72E40330B1c318cD12B7c3"
			},
			{
				token: "yUSD",
				weight: 0.3,
				decimals: 18,
				addr: "0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c"
			}
		],
		rewardAssetName: "ADX",
		rewardAssetAddr: ADDR_ADX,
		platformIcon: BalancerIcon,
		assetsIcons: [ADXIcon, YUSDIcon],
		special: true,
		latRewardBlock: 11494773,
		rewardsDurationDays: 30
	},
	{
		poolId: 2,
		name: "Balancer BAL-ETH",
		token: "BPT-BAL-ETH",
		platform: "Balancer",
		depositAssetName: "BPT-BAL-ETH",
		depositAssetAddr: "0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4",
		depositAssetDecimals: 18,
		getDepositAssetUrl:
			"https://pools.balancer.exchange/#/pool/0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4/",
		lpTokenAddr: "0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4",
		lpTokenData: [
			{
				token: "BAL",
				weight: 0.8,
				decimals: 18,
				addr: "0xba100000625a3754423978a60c9317c58a424e3D"
			},
			{
				token: "ETH",
				weight: 0.2,
				decimals: 18,
				addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
			}
		],
		rewardAssetName: "ADX",
		rewardAssetAddr: ADDR_ADX,
		platformIcon: BalancerIcon,
		assetsIcons: [BalancerIcon, ETHIcon],
		latRewardBlock: 11428515,
		rewardsDurationDays: 20
	},
	{
		poolId: 3,
		name: "Uniswap YFI-ETH",
		token: "UNI-YFI-ETH",
		platform: "Uniswap",
		depositAssetName: "UNI-YFI-ETH",
		depositAssetAddr: "0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28",
		depositAssetDecimals: 18,
		getDepositAssetUrl:
			"https://info.uniswap.org/pair/0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28",
		lpTokenAddr: "0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28",
		lpTokenData: [
			{
				token: "YFI",
				weight: 0.5,
				decimals: 18,
				addr: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e"
			},
			{
				token: "ETH",
				weight: 0.5,
				decimals: 18,
				addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
			}
		],
		rewardAssetName: "ADX",
		rewardAssetAddr: ADDR_ADX,
		platformIcon: UniswapIcon,
		assetsIcons: [YFIIcon, ETHIcon],
		latRewardBlock: 11428515,
		rewardsDurationDays: 20
	},
	{
		poolId: 4,
		name: "Uniswap UNI-ETH",
		token: "UNI-UNI-ETH",
		platform: "Uniswap",
		depositAssetName: "UNI-UNI-ETH",
		depositAssetAddr: "0xd3d2E2692501A5c9Ca623199D38826e513033a17",
		depositAssetDecimals: 18,
		getDepositAssetUrl:
			"https://info.uniswap.org/pair/0xd3d2E2692501A5c9Ca623199D38826e513033a17",
		lpTokenAddr: "0xd3d2E2692501A5c9Ca623199D38826e513033a17",
		lpTokenData: [
			{
				token: "UNI",
				weight: 0.5,
				decimals: 18,
				addr: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
			},
			{
				token: "ETH",
				weight: 0.5,
				decimals: 18,
				addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
			}
		],
		rewardAssetName: "ADX",
		rewardAssetAddr: ADDR_ADX,
		platformIcon: UniswapIcon,
		assetsIcons: [UniswapIcon, ETHIcon],
		latRewardBlock: 11428515,
		rewardsDurationDays: 20
	},
	{
		poolId: 5,
		name: "Uniswap LINK-ETH",
		token: "UNI-LINK-ETH",
		platform: "Uniswap",
		depositAssetName: "UNI-LINK-ETH",
		depositAssetAddr: "0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974",
		depositAssetDecimals: 18,
		getDepositAssetUrl:
			"https://info.uniswap.org/pair/0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974",
		lpTokenAddr: "0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974",
		lpTokenData: [
			{
				token: "LINK",
				weight: 0.5,
				decimals: 18,
				addr: "0x514910771af9ca656af840dff83e8264ecf986ca"
			},
			{
				token: "ETH",
				weight: 0.5,
				decimals: 18,
				addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
			}
		],
		rewardAssetName: "ADX",
		rewardAssetAddr: ADDR_ADX,
		platformIcon: UniswapIcon,
		assetsIcons: [LINKIcon, ETHIcon],
		latRewardBlock: 11428515,
		rewardsDurationDays: 20
	}
]
