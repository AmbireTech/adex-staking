import { Contract, utils } from "ethers"
import { ADDR_ADX, FARM_POOLS, ZERO, MAX_UINT } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"
import MasterChefABI from "../abi/MasterChef"
import { getSigner, getDefaultProvider } from "../ethereum"
import { getUserIdentity } from "../helpers/identity"
import { executeOnIdentity } from "./actions"
import { formatTokens, formatADX } from "../helpers/formatting"
import { TranslatableError } from "../helpers/errors"

// const MASTER_CHEF_ADDR = "0x2f0e755e0007E6569379a43E453F264b91336379" // goerli
const MASTER_CHEF_ADDR = "0xC0223ab23b519260AE7C52Dfb0a3dff65Da8385A"
// const AVG_ETH_BLOCK_TAME = 13.08
const DAYS_IN_YEAR = 365
// const SECS_IN_YEAR = DAYS_IN_YEAR * 24 * 60 * 60
// const TOTAL_FARM_ADX_REWARDS = 5_000_000
// const DAYS_TO_DISTRIBUTE_REWARDS = 30
const START_BLOCK = 11296000

// const AVG_BLOCKS_PER_YEAR = SECS_IN_YEAR / AVG_ETH_BLOCK_TAME

const defaultProvider = getDefaultProvider

const MasterChef = new Contract(
	MASTER_CHEF_ADDR,
	MasterChefABI,
	defaultProvider
)

const ADXToken = new Contract(ADDR_ADX, ERC20ABI, defaultProvider)

const getOtherTokenAndPoolPrice = (known, unknown) => {
	const totalLPPrice =
		(parseFloat(utils.formatUnits(known.poolBalance, known.decimals)) /
			known.weight) *
		known.usdPrice
	const unknownPrice =
		(totalLPPrice * unknown.weight) /
		parseFloat(utils.formatUnits(unknown.poolBalance, unknown.decimals))

	return { unknownPrice, totalLPPrice }
}

const getDepositLPTokenToADXValue = async ({ externalPrices }) => {
	if (!externalPrices || !externalPrices.USD) {
		throw new Error("errors.cantCallLPPricesWithoutADXUSDValue")
	}

	const adxPrice = externalPrices.USD

	const { allTokenContracts, allTokensInUSD } = FARM_POOLS.reduce(
		(data, { lpTokenData }) => {
			lpTokenData.forEach(token => {
				if (!data.allTokenContracts[token.token]) {
					data.allTokenContracts[token.token] = new Contract(
						token.addr,
						ERC20ABI,
						defaultProvider
					)
					data.allTokensInUSD[token.token] = null
				}
			})

			return data
		},
		{ allTokenContracts: {}, allTokensInUSD: {} }
	)

	allTokensInUSD["ADX"] = adxPrice

	const poolDataMap = FARM_POOLS.map(
		async ({ poolId, depositAssetName, depositAssetAddr, lpTokenData }) => {
			return {
				tokenName: depositAssetName,
				tokenAddr: depositAssetAddr,
				lpTokenData: await Promise.all(
					lpTokenData.map(async ({ token, addr, weight }, index) => ({
						poolId,
						token,
						addr,
						decimals: await allTokenContracts[token].decimals(),
						poolBalance: await allTokenContracts[token].balanceOf(
							depositAssetAddr
						),
						usdPrice: allTokensInUSD[token] || null,
						weight
					}))
				)
			}
		}
	)

	const poolDataWithBalances = await Promise.all(poolDataMap)

	const maxIters = 1 + poolDataWithBalances.length * 2
	let iters = 0

	while (Object.values(allTokensInUSD).includes(null) && iters <= maxIters) {
		poolDataWithBalances.map(poolData => {
			const { lpTokenData } = poolData
			const [t1, t2] = lpTokenData

			t1.usdPrice = t1.usdPrice || allTokensInUSD[t1.token]
			t2.usdPrice = t2.usdPrice || allTokensInUSD[t2.token]

			if (t1.usdPrice && !t2.usdPrice) {
				const { unknownPrice, totalLPPrice } = getOtherTokenAndPoolPrice(t1, t2)
				poolData.poolTotalPriceUSD = poolData.poolTotalPriceUSD || totalLPPrice
				t2.usdPrice = unknownPrice
				allTokensInUSD[t2.token] = t2.usdPrice
			} else if (!t1.usdPrice && t2.usdPrice) {
				const { unknownPrice, totalLPPrice } = getOtherTokenAndPoolPrice(t2, t1)
				poolData.poolTotalPriceUSD = poolData.poolTotalPriceUSD || totalLPPrice
				t1.usdPrice = unknownPrice
				allTokensInUSD[t1.token] = t1.usdPrice
			}

			poolData.lpTokenData = [t1, t2]

			return poolData
		})

		iters += 1
	}

	if (Object.values(allTokensInUSD).includes(null)) {
		throw new Error("errors.canCalcLPTokensPrices")
	}

	const lpTokensToADXData = poolDataWithBalances.reduce(
		(lpTokensToADX, data) => {
			const { poolTotalPriceUSD, lpTokenData } = data
			lpTokensToADX[data.tokenName] = {
				poolTotalPriceUSD,
				poolTotalADXValue: utils.parseUnits(
					((data.poolTotalPriceUSD / adxPrice) * 1_000_000).toFixed(0),
					12
				),
				lpTokenData
			}

			return lpTokensToADX
		},
		{}
	)

	return lpTokensToADXData
}

const getPoolStats = async ({
	pool,
	walletAddr,
	identityAddr,
	externalPrices,
	poolsPricesData
}) => {
	const depositTokenContract = new Contract(
		pool.depositAssetAddr,
		ERC20ABI,
		defaultProvider
	)

	const [
		totalSupply,
		totalStaked,
		walletBalance,
		pendingADX,
		userInfo,
		poolInfo,
		adxPerBlock,
		totalAllocPoint
	] = await Promise.all([
		depositTokenContract.totalSupply(),
		depositTokenContract.balanceOf(MasterChef.address),
		walletAddr ? depositTokenContract.balanceOf(walletAddr) : null,
		identityAddr ? MasterChef.pendingADX(pool.poolId, identityAddr) : null,
		identityAddr ? MasterChef.userInfo(pool.poolId, identityAddr) : null,
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

	const poolAllocPoints = poolInfo[1].toNumber()
	const totalStakedFloat = parseFloat(
		formatTokens(totalStaked, pool.depositAssetDecimals)
	)

	const totalRewardsADX =
		parseFloat(
			formatADX(adxPerBlock.mul(parseInt(pool.latRewardBlock - START_BLOCK)))
		) *
		(poolAllocPoints / totalAllocPoint)
	const totalPoolRewardsUSD = totalRewardsADX * externalPrices.USD

	const lpTokenPrice =
		poolsPricesData[pool.depositAssetName].poolTotalPriceUSD /
		parseFloat(formatTokens(totalSupply, pool.depositAssetDecimals))

	const lpTokenStakedValueUSD = totalStakedFloat * lpTokenPrice

	const rewardsDistributedPerMonthInUSD =
		totalPoolRewardsUSD * (30 / pool.rewardsDurationDays)

	const rewardsDistributedPerYearInUSD =
		totalPoolRewardsUSD * (DAYS_IN_YEAR / pool.rewardsDurationDays)

	const poolAPY = rewardsDistributedPerYearInUSD / (lpTokenStakedValueUSD || 1)
	const poolMPY = rewardsDistributedPerMonthInUSD / (lpTokenStakedValueUSD || 1)

	const lpTokenDataWithPrices = poolsPricesData[
		pool.depositAssetName
	].lpTokenData.map(data => {
		data.unitsPerLP = data.usdPrice
			? (lpTokenPrice * data.weight) / data.usdPrice
			: null
		return data
	})

	return {
		poolId: pool.poolId,
		lpTokenPrice,
		lpTokenDataWithPrices: lpTokenDataWithPrices,
		totalSupply,
		totalStaked,
		lpTokenStakedValueUSD,
		walletBalance,
		pendingADX,
		userInfo,
		userLPBalance,
		useShare,
		poolInfo,
		poolAPY,
		poolMPY
	}
}

export const getFarmPoolsStats = async ({
	chosenWalletType,
	externalPrices
}) => {
	try {
		const signer =
			chosenWalletType && chosenWalletType.library
				? await getSigner(chosenWalletType)
				: null

		const walletAddr = signer ? await signer.getAddress() : null
		const identityAddr = walletAddr ? getUserIdentity(walletAddr).addr : null

		const poolsPricesData = await getDepositLPTokenToADXValue({
			externalPrices
		})
		const poolsCalls = FARM_POOLS.map(pool =>
			getPoolStats({
				pool,
				walletAddr,
				identityAddr,
				externalPrices,
				poolsPricesData
			})
		)
		const allPoolStats = await Promise.all(poolsCalls)

		const statsByPoolId = allPoolStats.reduce((byId, stats) => {
			byId[stats.poolId] = stats
			return byId
		}, {})
		// const blockNumber = await defaultProvider.getBlockNumber()
		const totalRewards = [...Object.values(statsByPoolId)]
			.filter(x => !!x.pendingADX && x.pendingADX.gt(ZERO))
			.reduce((a, b) => a.add(b.pendingADX), ZERO)

		return {
			// blockNumber,
			pollStatsLoaded: true,
			userStatsLoaded: !!signer,
			totalRewards,
			statsByPoolId
		}
	} catch (error) {
		console.error("error getFarmPoolsStats", error)
		return {
			pollStatsLoaded: false,
			userStatsLoaded: false,
			totalRewards: ZERO,
			statsByPoolId: {}
		}
	}
}

export async function onLiquidityPoolDeposit({
	pool,
	stats,
	chosenWalletType,
	actionAmount,
	pendingADX
}) {
	if (!stats || !pool) throw new Error("errors.statsNotProvided")
	if (!actionAmount) throw new Error("errors.noDepositAmount")
	if (actionAmount.isZero())
		throw new TranslatableError("errors.zeroDepositToken", {
			currency: pool.depositAssetName
		})

	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")

	const walletAddr = await signer.getAddress()
	const identityAddr = getUserIdentity(walletAddr).addr

	const LPToken = new Contract(
		pool.depositAssetAddr, // just for testing
		ERC20ABI,
		defaultProvider
	)

	const [
		allowance,
		allowanceMC,
		balanceOnWallet,
		balanceOnIdentity,
		identityCode
	] = await Promise.all([
		LPToken.allowance(walletAddr, identityAddr),
		LPToken.allowance(identityAddr, MASTER_CHEF_ADDR),
		LPToken.balanceOf(walletAddr),
		LPToken.balanceOf(identityAddr),
		defaultProvider.getCode(identityAddr)
	])

	const isDeployed = identityCode !== "0x"

	if (actionAmount.gt(balanceOnWallet)) {
		throw new Error("errors.amountTooLarge")
	}

	const setAllowance = actionAmount.gt(ZERO) && !allowance.gte(actionAmount)

	const needed = actionAmount.sub(balanceOnIdentity)

	// set allowance to identity
	if (setAllowance) {
		const tokenWithSigner = LPToken.connect(signer)
		await tokenWithSigner.approve(identityAddr, MAX_UINT)
	}

	let identityTxns = []

	if (needed.gt(ZERO))
		identityTxns.push([
			LPToken.address,
			LPToken.interface.encodeFunctionData("transferFrom", [
				walletAddr,
				identityAddr,
				needed
			])
		])

	if (allowanceMC.lt(actionAmount)) {
		identityTxns.push([
			LPToken.address,
			LPToken.interface.encodeFunctionData("approve", [
				MASTER_CHEF_ADDR,
				MAX_UINT
			])
		])
	}

	identityTxns.push([
		MasterChef.address,
		MasterChef.interface.encodeFunctionData("deposit", [
			pool.poolId,
			actionAmount
		])
	])

	if (!!pendingADX && pendingADX.gt(ZERO)) {
		identityTxns.push([
			ADXToken.address,
			ADXToken.interface.encodeFunctionData("transfer", [
				walletAddr,
				pendingADX
			])
		])
	}

	return executeOnIdentity(
		chosenWalletType,
		identityTxns,
		setAllowance ? { gasLimit: isDeployed ? 269_420 : 469_420 } : {}
	)
}

export async function onLiquidityPoolWithdraw({
	pool,
	stats,
	chosenWalletType,
	actionAmount,
	pendingADX
}) {
	if (!stats || !pool) throw new Error("errors.statsNotProvided")
	if (!actionAmount) throw new Error("errors.noDepositAmount")

	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")

	const walletAddr = await signer.getAddress()
	const identityAddr = getUserIdentity(walletAddr).addr

	const LPToken = new Contract(pool.depositAssetAddr, ERC20ABI, defaultProvider)

	const [userInfo] = await Promise.all([
		MasterChef.userInfo(pool.poolId, identityAddr)
	])

	const userLPBalance = userInfo ? userInfo[0] : ZERO

	if (actionAmount.gt(userLPBalance)) {
		throw new Error("errors.amountTooLarge")
	}

	let identityTxns = []

	identityTxns.push([
		MasterChef.address,
		MasterChef.interface.encodeFunctionData("withdraw", [
			pool.poolId,
			actionAmount
		])
	])

	identityTxns.push([
		LPToken.address,
		LPToken.interface.encodeFunctionData("transfer", [walletAddr, actionAmount])
	])

	if (!!pendingADX && pendingADX.gt(ZERO)) {
		identityTxns.push([
			ADXToken.address,
			ADXToken.interface.encodeFunctionData("transfer", [
				walletAddr,
				pendingADX
			])
		])
	}

	return executeOnIdentity(chosenWalletType, identityTxns)
}

export async function onHarvestAll({ farmStats, chosenWalletType }) {
	if (!farmStats) throw new Error("errors.statsNotProvided")

	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")

	const walletAddr = await signer.getAddress()
	const identityAddr = getUserIdentity(walletAddr).addr

	const { statsByPoolId, totalRewards } = farmStats

	const poolsToHarvest = [...Object.values(statsByPoolId)].filter(
		pool => pool.pendingADX && pool.pendingADX.gt(ZERO)
	)

	if (!poolsToHarvest.length) {
		throw new Error("errors.nothingToHarvest")
	}

	const totalADXRewards = poolsToHarvest.reduce(
		(a, b) => a.add(b.pendingADX),
		ZERO
	)

	if (!totalRewards.eq(totalADXRewards)) {
		throw new Error("errors.invalidTotalRewards")
	}

	const identityTxns = poolsToHarvest.reduce((txns, pool) => {
		const { poolId } = pool
		txns.push([
			MasterChef.address,
			MasterChef.interface.encodeFunctionData("withdraw", [poolId, ZERO])
		])

		return txns
	}, [])

	const toHarvest = (await ADXToken.balanceOf(identityAddr)).add(
		totalADXRewards
	)
	identityTxns.push([
		ADXToken.address,
		ADXToken.interface.encodeFunctionData("transfer", [walletAddr, toHarvest])
	])

	return executeOnIdentity(chosenWalletType, identityTxns)
}
