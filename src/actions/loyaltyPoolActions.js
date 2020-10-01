import { Contract } from "ethers"
import ERC20ABI from "../abi/ERC20"
import { ADDR_ADX, ADDR_ADX_LOYALTY_TOKEN, ZERO } from "../helpers/constants"
import { getSigner, defaultProvider } from "../ethereum"

const provider = defaultProvider
const Token = new Contract(ADDR_ADX, ERC20ABI, provider)
const LoyaltyToken = new Contract(ADDR_ADX_LOYALTY_TOKEN, ERC20ABI, provider)
const ZERO_ADDR = "0x0000000000000000000000000000000000000000"

export async function loadDepositsStats(walletAddr) {
	walletAddr = "0xd6e371526cdaee04cd8af225d42e37bc14688d9e"
	const [
		totalADX,
		balanceLpToken,
		totalSupplyLPT,
		loyaltyTokenTransfersLogs,
		adexTokenTransfersLogs
	] = await Promise.all([
		Token.balanceOf(ADDR_ADX_LOYALTY_TOKEN),
		LoyaltyToken.totalSupply(),
		LoyaltyToken.balanceOf(walletAddr),
		provider.getLogs({
			fromBlock: 0,
			...LoyaltyToken.filters.Transfer(null, walletAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(walletAddr, ADDR_ADX_LOYALTY_TOKEN, null)
		})
	])

	const balanceLpADX = balanceLpToken.mul(totalADX).div(totalSupplyLPT)

	const currentBalance = {
		balanceLpToken,
		balanceLpADX
	}

	const hasExternalLoyaltyTokenTransfers = loyaltyTokenTransfersLogs.some(
		log => LoyaltyToken.interface.parseLog(log).values[0] !== ZERO_ADDR
	)

	// rewards === null => unknown rewards - can not be calculated
	if (hasExternalLoyaltyTokenTransfers) {
		currentBalance.rewards = null
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

	const avgDepositPrice = userDeposits.adxLPT.div(userDeposits.adx)

	const depositedADX = balanceLpADX.div(avgDepositPrice)

	const reward = balanceLpADX - depositedADX

	currentBalance.reward = reward

	return currentBalance
}
