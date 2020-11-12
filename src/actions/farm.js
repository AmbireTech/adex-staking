import { Contract } from "ethers"
import { FARM_TOKENS } from "../helpers/constants"
import ERC20ABI from "../abi/ERC20"
import { getSigner, defaultProvider } from "../ethereum"
import { getUserIdentity } from "../helpers/identity"

const getUserBalances = async ({ tokenContract, signer }) => {
	if (!signer) {
		return {
			identityBalance: null,
			walletBalance: null
		}
	} else {
		const walletAddr = await signer.getAddress()
		const identityAddr = getUserIdentity(walletAddr).addr

		const [identityBalance, walletBalance] = await Promise.all([
			tokenContract.balanceOf(identityAddr),
			tokenContract.balanceOf(walletAddr)
		])

		return {
			identityBalance,
			walletBalance
		}
	}
}

const getTokenStats = async ({ token, signer }) => {
	const tokenContract = new Contract(
		token.depositAssetsAddr,
		ERC20ABI,
		defaultProvider
	)

	const [totalSupply, { identityBalance, walletBalance }] = await Promise.all([
		tokenContract.totalSupply(),
		getUserBalances({ tokenContract, signer })
	])

	return {
		totalSupply,
		identityBalance,
		walletBalance
	}
}

export const getFarmTokensStats = async ({ chosenWalletType }) => {
	const signer =
		chosenWalletType && chosenWalletType.library
			? await getSigner(chosenWalletType)
			: null

	const tokenCalls = FARM_TOKENS.map(token => getTokenStats({ token, signer }))
	const allTokensStats = await Promise.all(tokenCalls)

	return allTokensStats
}
