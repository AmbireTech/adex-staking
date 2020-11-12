import { Contract } from "ethers"
import { FARM_POOLS, ZERO } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"
import MasterChefABI from "../abi/MasterChef"
import { getSigner, defaultProvider } from "../ethereum"
import { getUserIdentity } from "../helpers/identity"

const MASTER_CHEF_ADDR = "0x2f0e755e0007E6569379a43E453F264b91336379"

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

const getPoolStats = async ({ pool, walletAddr, identityAddr }) => {
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
		poolInfo
	] = await Promise.all([
		depositTokenContract.totalSupply(),
		depositTokenContract.balanceOf(MasterChef.address),
		getUserBalances({ depositTokenContract, walletAddr, identityAddr }),
		identityAddr ? MasterChef.pendingADX(pool.poolId, walletAddr) : null,
		identityAddr ? MasterChef.userInfo(pool.poolId, walletAddr) : null,
		identityAddr ? MasterChef.poolInfo(pool.poolId) : null
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
		poolInfo
	}
}

export const getFarmPoolsStats = async ({ chosenWalletType }) => {
	const signer =
		chosenWalletType && chosenWalletType.library
			? await getSigner(chosenWalletType)
			: null

	const walletAddr = signer ? await signer.getAddress() : null
	const identityAddr = walletAddr ? getUserIdentity(walletAddr).addr : null

	const poolsCalls = FARM_POOLS.map(pool =>
		getPoolStats({ pool, walletAddr, identityAddr })
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
