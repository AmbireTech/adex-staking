export async function getSigner(chosenWalletType) {
	console.log("chosenWalletType", chosenWalletType)
	if (!chosenWalletType || !chosenWalletType.library)
		throw new Error("library not provided")
	return chosenWalletType.library.getSigner()
}
