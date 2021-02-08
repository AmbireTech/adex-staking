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
            amount: BigNumber.from(1000 + decimalsString),
            blockNumber: 11295886
        },
        {
            label: 'Tom Staking Pool V5',
            type: STAKING_POOL_EVENT_TYPES.leave,
            amount: BigNumber.from(420 + decimalsString),
            blockNumber: 11482093
        },
        {
            label: 'Tom Staking Pool V5',
            type: STAKING_POOL_EVENT_TYPES.withdraw,
            amount: BigNumber.from(420 + decimalsString),
            blockNumber: 11661741
        },
        {
            label: 'Tom Staking Pool V5',
            type: STAKING_POOL_EVENT_TYPES.rageLeave,
            amount: BigNumber.from(460 + decimalsString),
            blockNumber: 11789046
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
			...StakingPool.filters.LogLeave(identityAddr, ADDR_STAKING_POOL, null)
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
			type: STAKING_POOL_EVENT_TYPES.enter,
			amount: parsedLog.args.amount, // [2]
			blockNumber: log.blockNumber
			// time: //TODO
		}
	})

	const userLeaves = leaveLogs.map(log => {
		const parsedLog = StakingPool.interface.parseLog(log)

		return {
			type: STAKING_POOL_EVENT_TYPES.leave,
			willUnlockAt: parsedLog.args.willUnlockAt, //[1]
			adxAmount: parsedLog.args.adxAmount, // [2]
			blockNumber: log.blockNumber
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
			type: !!burnTxLog
				? STAKING_POOL_EVENT_TYPES.rageLeave
				: STAKING_POOL_EVENT_TYPES.withdraw,
			amount: parsedADXTransferLog.args.amount, //[2]
			blockNumber: log.blockNumber
			// time: //TODO
		}
	})

	const stakings = userEnters.concat(userLeaves).concat(userWithdraws)

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
		userDataLoaded: true
	}
}
