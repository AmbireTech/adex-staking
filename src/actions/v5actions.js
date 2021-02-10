import { Contract, BigNumber } from "ethers"
import ERC20ABI from "../abi/ERC20"
import ADXTokenABI from "../abi/ADXToken"
import ADXSupplyControllerABI from "../abi/ADXSupplyController"
import { ADDR_ADX, ZERO } from "../helpers/constants"
import { getDefaultProvider } from "../ethereum"
// import { getPrices, executeOnIdentity } from './common'

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

export const STAKING_POOL_EVENT_TYPES = {
	enter: "enter",
	leave: "leave",
	withdraw: "withdraw",
	rageLeave: "rageLeave"
}

export const STAKING_POOL_EMPTY_STATS = {
	balanceSPToken: ZERO,
	balanceSPADX: ZERO,
	rewardADX: ZERO,
	poolTotalStaked: ZERO,
	currentAPY: 0,
	stakings: [],
	loaded: false,
	userDataLoaded: false
}

export async function onMigrationToV5(
	chosenWalletType,
	{ amount, poolId, nonce }
) {
	// TODO: waiting for migration contract
	console.log(chosenWalletType, amount, poolId, nonce)
}

export async function onStakingPoolV5Deposit(
	chosenWalletType,
	{ amount, poolId }
) {
	console.log("onStakingPoolV5Deposit")
	// TODO:
}

export async function onStakingPoolV5Withdraw(
	chosenWalletType,
	{ amount, poolId }
) {
	console.log("onStakingPoolV5Withdraw", amount)
	// TODO:
}

export async function getTomStakingV5PoolData() {
	const [poolTotalStaked, incentivePerSecond] = await Promise.all([
		Token.balanceOf(ADDR_STAKING_POOL),
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

// to test the ui component
/*
export async function loadUserTomStakingV5PoolStats({ identityAddr } = {}) {

	const poolData = await getTomStakingV5PoolData()
	if (!identityAddr) {
		return {
			...STAKING_POOL_EMPTY_STATS,
			...poolData,
			loaded: true
		}
	}

	const decimalsString = '000000000000000000'

	const stakings = [
		{
			label: 'Tom Staking Pool V5',
			type: STAKING_POOL_EVENT_TYPES.enter,
			amount: BigNumber.from(2000 + decimalsString),
			blockNumber: 11295886,
			transactionHash: 1
		},
		{
			label: 'Tom Staking Pool V5',
			type: STAKING_POOL_EVENT_TYPES.leave,
			withdrawTxHash: 4,
			amount: BigNumber.from(420 + decimalsString),
			blockNumber: 11482093,
			transactionHash: 2
		},
		{
			label: 'Tom Staking Pool V5',
			type: STAKING_POOL_EVENT_TYPES.leave,
			amount: BigNumber.from(500 + decimalsString),
			blockNumber: 11482999,
			transactionHash: 3
		},
		{
			label: 'Tom Staking Pool V5',
			type: STAKING_POOL_EVENT_TYPES.withdraw,
			amount: BigNumber.from(420 + decimalsString),
			blockNumber: 11661741,
			transactionHash: 4
		},
		{
			label: 'Tom Staking Pool V5',
			type: STAKING_POOL_EVENT_TYPES.rageLeave,
			amount: BigNumber.from(333 + decimalsString),
			blockNumber: 11789046,
			transactionHash: 5
		},
	]

	const withTimestamp = await Promise.all(
		stakings.map(async (stakngEvent) => {
			const { timestamp } = (await provider.getBlock(stakngEvent.blockNumber))
			return {
				...stakngEvent,
				timestamp: timestamp * 1000
			}

		})
	)

	const balanceSPADX = BigNumber.from(4 + decimalsString)

	return {
		...poolData,
		balanceSPADX,
		stakings: withTimestamp,
		loaded: true,
		userDataLoaded: true
	}
}
*/

export async function loadUserTomStakingV5PoolStats({ identityAddr } = {}) {
	const poolData = await getTomStakingV5PoolData()
	if (!identityAddr) {
		return {
			...STAKING_POOL_EMPTY_STATS,
			...poolData,
			loaded: true
		}
	}

	const [
		balanceSPToken,
		currentShareValue,
		mintLogs,
		enterTransferLogs,
		leaveLogs,
		withdrawLogs,
		rageLeaveLogs
	] = await Promise.all([
		StakingPool.balanceOf(identityAddr),
		StakingPool.shareValue(),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.Transfer(null, identityAddr, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...Token.filters.Transfer(identityAddr, ADDR_STAKING_POOL, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogLeave(identityAddr, null, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogWithdraw(identityAddr, null, null, null)
		}),
		provider.getLogs({
			fromBlock: 0,
			...StakingPool.filters.LogRageLeave(identityAddr, null, null, null)
		})
	])

	const balanceSPADX = balanceSPToken.mul(currentShareValue)

	const enterTransferByTxHash = enterTransferLogs.reduce((txns, log) => {
		txns[log.transactionHash] = log
		return txns
	}, {})

	const userEnters = mintLogs
		.msp(log => {
			const adxTransferLog = enterTransferByTxHash[log.transactionHash]
			const parsedADXTransferLog = adxTransferLog
				? Token.interface.parseLog(log)
				: null

			if (parsedADXTransferLog) {
				const parsedMintLog = StakingPool.interface.parseLog(log)
				return {
					transactionHash: log.transactionHash,
					type: STAKING_POOL_EVENT_TYPES.enter,
					shares: parsedMintLog.args.amount, // [2]
					adxAmount: parsedADXTransferLog.args.amount, // [2]
					blockNumber: log.blockNumber
				}
			} else {
				return null
			}
		})
		.filter(x => !!x)

	const userWithdraws = withdrawLogs.map(log => {
		const parsedWithdrawLog = StakingPool.interface.parseLog(log)
		const {
			shares,
			unlocksAt,
			maxTokens,
			receivedTokens
		} = parsedWithdrawLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.withdraw,
			shares, //[1]
			unlocksAt, //[2]
			maxTokens, //[3]
			receivedTokens, //[4]
			blockNumber: log.blockNumber
		}
	})

	const userRageLeaves = rageLeaveLogs.map(log => {
		const parsedRageLeaveLog = StakingPool.interface.parseLog(log)

		const { shares, adxAmount, receivedTokens } = parsedRageLeaveLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.rageLeave,
			shares, //[1]
			adxAmount, //[2]
			receivedTokens, //[3]
			blockNumber: log.blockNumber
		}
	})

	const userLeaves = leaveLogs.map(log => {
		const parsedLog = StakingPool.interface.parseLog(log)
		const { shares, unlocksAt, maxTokens } = parsedLog.args

		return {
			transactionHash: log.transactionHash,
			type: STAKING_POOL_EVENT_TYPES.leave,
			shares, // [1]
			unlocksAt, //[2]
			maxTokens, // [3]
			blockNumber: log.blockNumber
			//TODO: detect withdraw tx
		}
	})

	const stakings = userEnters
		.concat(userLeaves)
		.concat(userWithdraws)
		.concat(userRageLeaves)

	const withTimestamp = await Promise.all(
		stakings.map(async stakngEvent => {
			const { timestamp } = await provider.getBlock(stakngEvent.blockNumber)
			return {
				...stakngEvent,
				timestamp: timestamp * 1000
			}
		})
	)

	return {
		...poolData,
		balanceSPADX,
		stakings: withTimestamp,
		loaded: true,
		userDataLoaded: true
	}
}
