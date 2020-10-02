import { Contract } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXLoyaltyPoolTokenABI from "../abi/ADXLoyaltyPoolToken"
import { ADDR_ADX, ADDR_ADX_LOYALTY_TOKEN, ZERO } from "../helpers/constants"
import { getSigner, defaultProvider } from "../ethereum"

const provider = defaultProvider
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const LoyaltyToken = new Contract(
	ADDR_ADX_LOYALTY_TOKEN,
	ADXLoyaltyPoolTokenABI,
	provider
)
const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const ADX_LP_TOKEN_DECIMALS_MUL = "1000000000000000000"

export async function loadDepositsStats(walletAddr) {
	walletAddr = "0xd6e371526cdaee04cd8af225d42e37bc14688d9e"
	const [
		balanceLpToken,
		currentShareValue,
		loyaltyTokenTransfersLogs,
		adexTokenTransfersLogs
	] = await Promise.all([
		LoyaltyToken.balanceOf(walletAddr),
		LoyaltyToken.shareValue(),
		provider.getLogs({
			fromBlock: 0,
			...LoyaltyToken.filters.Transfer(null, walletAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(walletAddr, ADDR_ADX_LOYALTY_TOKEN, null)
		})
	])

	const balanceLpADX = balanceLpToken
		.mul(currentShareValue)
		.div(ADX_LP_TOKEN_DECIMALS_MUL)

	const currentBalance = {
		balanceLpToken,
		balanceLpADX,
		loaded: true
	}

	const hasExternalLoyaltyTokenTransfers = loyaltyTokenTransfersLogs.some(
		log => LoyaltyToken.interface.parseLog(log).values[0] !== ZERO_ADDR
	)

	// reward === null => unknown reward - can not be calculated
	if (hasExternalLoyaltyTokenTransfers) {
		currentBalance.rewardADX = null
		return currentBalance
	}

	const adxTransfersByTxHash = adexTokenTransfersLogs.reduce((txns, log) => {
		txns[log.transactionHash] = log
		return txns
	}, {})

	const userDeposits = loyaltyTokenTransfersLogs.reduce(
		(deposits, log) => {
			const axdTransferLog = adxTransfersByTxHash[log.transactionHash]

			if (axdTransferLog) {
				const lpTokenLog = LoyaltyToken.interface.parseLog(log)
				const adxTransferLog = Token.interface.parseLog(axdTransferLog)

				deposits.adx = deposits.adx.add(lpTokenLog.values[2])
				deposits.adxLPT = deposits.adxLPT.add(adxTransferLog.values[2])
			}

			return deposits
		},
		{ adx: ZERO, adxLPT: ZERO }
	)

	// multiply by decimals to keep the precision
	const avgDepositShareValue = userDeposits.adx
		.mul(ADX_LP_TOKEN_DECIMALS_MUL)
		.div(userDeposits.adxLPT)
	const reward = balanceLpToken
		.mul(currentShareValue.sub(avgDepositShareValue))
		.div(ADX_LP_TOKEN_DECIMALS_MUL)

	// console.log('reward', reward.toString())
	// console.log('balanceLpToken', balanceLpToken.toString())
	// console.log('balanceLpADX', balanceLpADX.toString())

	currentBalance.rewardADX = reward

	return currentBalance
}
