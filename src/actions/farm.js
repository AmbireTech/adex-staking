import { Contract, utils } from "ethers"
import { FARM_POOLS, ZERO, MAX_UINT } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"
import MasterChefABI from "../abi/MasterChef"
import { getSigner, defaultProvider } from "../ethereum"
import { getUserIdentity } from "../helpers/identity"
import { executeOnIdentity } from "./actions"

// const MASTER_CHEF_ADDR = "0x2f0e755e0007E6569379a43E453F264b91336379" // goerli
const MASTER_CHEF_ADDR = "0xC0223ab23b519260AE7C52Dfb0a3dff65Da8385A"
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
	const adxPrice = externalPrices.USD || 0.27

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
		async ({
			poolId,
			lpTokenAddr,
			depositAssetName,
			depositAssetAddr,
			lpTokenData
		}) => {
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
							lpTokenAddr || depositAssetAddr
						),
						poolTotalPriceUSD: null,
						usdPrice: allTokensInUSD[token] || null,
						weight
					}))
				)
			}
		}
	)

	const poolDataWithBalances = await Promise.all(poolDataMap)

	while (Object.values(allTokensInUSD).includes(null)) {
		poolDataWithBalances.map(poolData => {
			const { lpTokenData } = poolData
			const t1 = lpTokenData[0]
			const t2 = lpTokenData[1]

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
	externalPrices
}) => {
	const depositTokenContract = new Contract(
		pool.depositAssetAddr,
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

	const prices = await getDepositLPTokenToADXValue({ externalPrices })

	const poolTotalADXValue = prices[pool.depositAssetName].poolTotalADXValue

	const poolAPY =
		poolADXPerYear
			.mul(precision)
			.div(poolTotalADXValue)
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
		poolAPY
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

export async function onLiquidityPoolDeposit({
	pool,
	stats,
	chosenWalletType,
	actionAmount
}) {
	if (!stats || !pool) throw new Error("errors.statsNotProvided")
	if (!actionAmount) throw new Error("errors.noDepositAmount")
	if (actionAmount.isZero()) throw new Error("errors.zeroDeposit")

	const signer = await getSigner(chosenWalletType)
	if (!signer) throw new Error("errors.failedToGetSigner")

	const walletAddr = await signer.getAddress()
	const identityAddr = getUserIdentity(walletAddr).addr

	const LPToken = new Contract(
		pool.depositAssetAddr, // just for testing
		ERC20ABI,
		defaultProvider
	)

	const [allowance, allowanceMC, balanceOnWallet] = await Promise.all([
		LPToken.allowance(walletAddr, identityAddr),
		LPToken.allowance(identityAddr, MASTER_CHEF_ADDR),
		LPToken.balanceOf(walletAddr)
	])

	if (actionAmount.gt(balanceOnWallet)) {
		throw new Error("errors.amountTooLarge")
	}

	const setAllowance = actionAmount.gt(ZERO) && !allowance.gte(actionAmount)

	// set allowance to identity
	if (setAllowance) {
		const tokenWithSigner = LPToken.connect(signer)
		await tokenWithSigner.approve(identityAddr, MAX_UINT)
	}

	let identityTxns = []

	if (allowanceMC.lt(actionAmount)) {
		identityTxns.push([
			LPToken.address,
			LPToken.interface.functions.approve.encode([MASTER_CHEF_ADDR, MAX_UINT])
		])
	}

	identityTxns.push([
		MasterChef.address,
		MasterChef.interface.functions.deposit.encode([pool.poolId, actionAmount])
	])

	return executeOnIdentity(
		chosenWalletType,
		identityTxns,
		setAllowance ? { gasLimit: 450000 } : {}
	)
}

export async function onLiquidityPoolWithdraw({
	pool,
	stats,
	chosenWalletType,
	actionAmount
}) {
	console.log("onLiquidityPoolWithdraw", stats)

	// TODO:
}
