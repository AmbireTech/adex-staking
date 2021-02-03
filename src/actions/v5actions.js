import { Contract } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXTokenABI from "../abi/ADXToken"
import ADXSupplyControllerABI from "../abi/ADXSupplyController"
import { ADDR_ADX, ADDR_ADX_LOYALTY_TOKEN } from "../helpers/constants"
import { getDefaultProvider } from "../ethereum"
import { getUserIdentity } from "../helpers/identity"

const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
const ADDR_STAKING_POOL = "0x0000000000000000000000000000000000000000"
const ADDR_ADX_SUPPLY_CONTROLLER = "0x617e6f354d288fcb33e148b1bb6d2cc9be1f7695"
const stakingPoolABI = ERC20ABI //TODO
const supplyControllerABI = ADXSupplyControllerABI
const secondsInYear = 60 * 60 * 24 * 365
const PRECISION = 1_000_000

const provider = getDefaultProvider

const Token = new Contract(ADDR_ADX, ADXTokenABI, provider)
const ADXSupplyController = new Contract(
	ADDR_ADX_SUPPLY_CONTROLLER,
	supplyControllerABI,
	provider
)
const StakingPool = new Contract(ADDR_STAKING_POOL, stakingPoolABI, provider)

export async function onMigrationToV5(
	chosenWalletType,
	{ amount, poolId, nonce }
) {
	// TODO: waiting for migration contract
	console.log(chosenWalletType, amount, poolId, nonce)
}

export async function getStakingPortalData() {
	const [poolTotalStaked, incentivePerSecond] = await Promise.all([
		Token.balanceOf(ADDR_ADX_LOYALTY_TOKEN),
		ADXSupplyController.incentivePerSecond(ADDR_STAKING_POOL)
	])

	return {
		poolTotalStaked,
		incentivePerSecond,
		currentAPY: incentivePerSecond.isZero()
			? 0
			: (incentivePerSecond
					.mul(PRECISION)
					.mul(secondsInYear)
					.div(incentivePerSecond)
					.toNumber() /
					PRECISION) *
			  100
	}
}

export async function getStakings({ walletAddr, prices }) {
	const identityAddr = getUserIdentity(walletAddr).addr

	const [
		balanceSPToken,
		currentShareValue,
		enterLogs,
		leaveLogs,
		adexTokenTransfersLogs,
		burnLogs // To detect rage leave
	] = await Promise.all([
		StakingPool.balanceOf(identityAddr),
		StakingPool.shareValue(),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(null, identityAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogLeave(walletAddr, ADDR_ADX_LOYALTY_TOKEN, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(ADDR_STAKING_POOL, identityAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(identityAddr, ZERO_ADDR, null)
		})
	])

	const balanceSPADX = balanceSPToken.mul(currentShareValue)

	const userEnters = enterLogs.msp(log => {
		const parsedLog = StakingPool.interface.parseLog(log)

		return {
			amount: parsedLog[2]
			// time: //TODO
		}
	})

	const userLeaves = leaveLogs.map(log => {
		const parsedLog = StakingPool.interface.parseLog(log)

		return {
			willUnlockAt: parsedLog[1],
			adxAmount: parsedLog[2]
			// time: //TODO
		}
	})

	const burnsByTxHash = burnLogs.reduce((txns, log) => {
		txns[log.transactionHash] = log
		return txns
	}, {})

	const userWithdraws = adexTokenTransfersLogs.map(log => {
		const burnTxLog = burnsByTxHash[log.transactionHash]
		const parsedADXTransferLog = Token.interface.parseLog(log)

		return {
			amount: parsedADXTransferLog[1],
			isRageLeave: !!burnTxLog
			// time: //TODO
		}
	})

	return {
		balanceSPADX,
		userEnters,
		userLeaves,
		userWithdraws
	}
}
