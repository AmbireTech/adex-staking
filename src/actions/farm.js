import { Contract } from "ethers"
import { FARM_POOLS, ZERO } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"
import MasterChefABI from "../abi/MasterChef"
import { getSigner, defaultProvider } from "../ethereum"
import { getUserIdentity } from "../helpers/identity"

const MASTER_CHEF_ADDR = "0x2f0e755e0007E6569379a43E453F264b91336379"
const AVG_ETH_BLOCK_TAME = 13.08
const SECS_IN_YEAR = 365 * 24 * 60 * 60

const AVG_BLOCKS_PER_YEAR = SECS_IN_YEAR / AVG_ETH_BLOCK_TAME

const MasterChef = new Contract(
	MASTER_CHEF_ADDR,
	MasterChefABI,
	defaultProvider
)

const getUserBalances = async ({
	depositTokenContract,
	walletAddr,
	identityAddr
}) => {
	if (!walletAddr) {
		return {
			identityBalance: null,
			walletBalance: null
		}
	} else {
		const [identityBalance, walletBalance] = await Promise.all([
			depositTokenContract.balanceOf(identityAddr),
			depositTokenContract.balanceOf(walletAddr)
		])

		return {
			identityBalance,
			walletBalance
		}
	}
}

const getDepositLPTokenToADXValue = ({ externalPrices }) => {
	// TODO
	const lpTokensToADX = {
		TST: 10000
	}

	return lpTokensToADX
}

const getPoolStats = async ({
	pool,
	walletAddr,
	identityAddr,
	externalPrices
}) => {
	const depositTokenContract = new Contract(
		pool.depositAssetsAddr,
		ERC20ABI,
		defaultProvider
	)

	const [
		totalSupply,
		totalStaked,
		{ identityBalance, walletBalance },
		pendingADX,
		userInfo,
		poolInfo,
		adxPerBlock,
		totalAllocPoint
	] = await Promise.all([
		depositTokenContract.totalSupply(),
		depositTokenContract.balanceOf(MasterChef.address),
		getUserBalances({ depositTokenContract, walletAddr, identityAddr }),
		identityAddr ? MasterChef.pendingADX(pool.poolId, walletAddr) : null,
		identityAddr ? MasterChef.userInfo(pool.poolId, walletAddr) : null,
		MasterChef.poolInfo(pool.poolId),
		MasterChef.ADXPerBlock(),
		MasterChef.totalAllocPoint()
	])
	const precision = 10_000_000

	const userLPBalance = userInfo ? userInfo[0] : null

	const useShare =
		userLPBalance && totalStaked.gt(ZERO)
			? userLPBalance
					.mul(precision)
					.div(totalStaked)
					.toNumber() / precision
			: null

	const poolAdxPerBlock = totalAllocPoint.gt(ZERO)
		? poolInfo[1].mul(adxPerBlock).div(totalAllocPoint)
		: ZERO

	const poolADXPerYear = poolAdxPerBlock.mul(AVG_BLOCKS_PER_YEAR.toFixed(0))

	const prices = getDepositLPTokenToADXValue({ externalPrices })

	const stakedToADX = totalStaked.mul(
		(prices[pool.depositAssetsName] * precision).toFixed(0)
	)

	const poolAPY =
		poolADXPerYear
			.mul(precision)
			.mul(precision)
			.div(stakedToADX)
			.toNumber() / precision

	return {
		poolId: pool.poolId,
		totalSupply,
		totalStaked,
		identityBalance,
		walletBalance,
		pendingADX,
		userInfo,
		userLPBalance,
		useShare,
		poolInfo,
		poolAdxPerBlock,
		poolADXPerYear,
		poolAPY: parseFloat(poolAPY.toFixed(4))
	}
}

export const getFarmPoolsStats = async ({
	chosenWalletType,
	externalPrices
}) => {
	const signer =
		chosenWalletType && chosenWalletType.library
			? await getSigner(chosenWalletType)
			: null

	const walletAddr = signer ? await signer.getAddress() : null
	const identityAddr = walletAddr ? getUserIdentity(walletAddr).addr : null

	const poolsCalls = FARM_POOLS.map(pool =>
		getPoolStats({ pool, walletAddr, identityAddr, externalPrices })
	)
	const allPoolStats = await Promise.all(poolsCalls)
	const statsByPoolId = allPoolStats.reduce((byId, stats) => {
		byId[stats.poolId] = stats
		return byId
	}, {})

	return {
		pollStatsLoaded: true,
		userStatsLoaded: !!signer,
		statsByPoolId
	}
}
