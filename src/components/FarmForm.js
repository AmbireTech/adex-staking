import React, { useState, useContext, useCallback } from "react"
import {
	onLiquidityPoolDeposit,
	onLiquidityPoolWithdraw,
	isValidNumberString
} from "../actions"
import {
	parseTokens,
	formatTokens,
	formatADXPretty,
	toIdAttributeString
} from "../helpers/formatting"
import { ZERO } from "../helpers/constants"
import {
	TextField,
	Button,
	FormControlLabel,
	Checkbox,
	Box
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import AppContext from "../AppContext"
import { useTranslation } from "react-i18next"
import { FarmPoolData } from "./FarmCard"
import Tooltip from "./Tooltip"

export default function FarmForm({
	closeDialog,
	pool,
	stats,
	withdraw,
	blockNumber
}) {
	const { t } = useTranslation()
	const { chosenWalletType, wrapDoingTxns } = useContext(AppContext)

	const [actionAmount, setActionAmount] = useState("")
	const [amountErr, setAmountErr] = useState(false)
	const [amountErrText, setAmountErrText] = useState("")
	const [confirmation, setConfirmation] = useState(false)

	const actionName = withdraw ? "withdraw" : "deposit"
	const { depositAssetDecimals, depositAssetName } = pool

	const { pendingADX, userLPBalance, walletBalance } = stats

	const maxAmount = withdraw ? userLPBalance || ZERO : walletBalance
	const showRewards = withdraw && pendingADX && pendingADX.gt(ZERO)
	const showRewardsOnDeposit = !withdraw && pendingADX && pendingADX.gt(ZERO)

	const confirmationLabel = pool.confirmationLabel
	const confirmed = !confirmationLabel || confirmation

	const disableActionsMsg = !confirmed
		? t("farm.noConfirmed")
		: !!amountErr
		? amountErrText
		: !pool || !stats
		? t("errors.statsNotProvided")
		: ""

	const disableDepositsMsg = !!disableActionsMsg
		? disableActionsMsg
		: !walletBalance || walletBalance.isZero()
		? t("farm.zeroBalanceDeposit", { currency: depositAssetName })
		: !actionAmount
		? t("errors.amountNotSelected")
		: ""

	const disableWithdrawMsg = !!disableActionsMsg
		? disableActionsMsg
		: !userLPBalance || userLPBalance.isZero()
		? t("farm.zeroBalanceWithdraw", { currency: depositAssetName })
		: !actionAmount
		? t("errors.amountNotSelected")
		: ""

	const disableRewardsWithdrawMsg = !!disableActionsMsg
		? disableActionsMsg
		: !pendingADX || pendingADX.isZero()
		? t("farm.noRewards", { currency: "ADX" })
		: ""

	const onAction = useCallback(
		amount => {
			setConfirmation(false)

			const action = withdraw ? onLiquidityPoolWithdraw : onLiquidityPoolDeposit

			if (closeDialog) closeDialog()

			wrapDoingTxns(
				action.bind(null, {
					pool,
					stats,
					chosenWalletType,
					actionAmount: parseTokens(amount, depositAssetDecimals),
					pendingADX
				})
			)()
		},
		[
			chosenWalletType,
			closeDialog,
			depositAssetDecimals,
			pendingADX,
			pool,
			stats,
			withdraw,
			wrapDoingTxns
		]
	)

	const onRewardsWithdraw = () => {
		onAction("0.00")
	}

	const validateFields = params => {
		const { userInputAmount } = params

		if (!isValidNumberString(userInputAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.invalidAmountInput"))
			return
		}

		const amountBN = parseTokens(userInputAmount, depositAssetDecimals)

		const minStakingAmountBN = parseTokens(
			pool.minStakingAmount || "0",
			depositAssetDecimals
		)

		if (amountBN.gt(maxAmount)) {
			setAmountErr(true)
			setAmountErrText(t("errors.lowADXAmount"))
			return
		}
		if (pool && amountBN.lte(minStakingAmountBN)) {
			setAmountErr(true)
			setAmountErrText(
				t("errors.lessDanMinPoolAmount", { currency: depositAssetName })
			)
			return
		}

		if (
			!withdraw &&
			pool &&
			stats.poolTotalStaked &&
			pool.poolDepositsLimit &&
			amountBN.add(stats.poolTotalStaked).gt(pool.poolDepositsLimit)
		) {
			setAmountErr(true)
			setAmountErrText(t("errors.amountOverPoolLimit"))
			return
		}

		setAmountErr(false)
		return
	}

	const onAmountChange = amountStr => {
		setActionAmount(amountStr)
		validateFields({
			userInputAmount: amountStr
		})
	}

	return (
		<Box width={1}>
			<Box>
				<TextField
					fullWidth
					id={`new-farm-${actionName}-form-amount-field`}
					required
					label={t("farm.labelLPTokenAmount", { token: depositAssetName })}
					type="text"
					value={actionAmount}
					error={amountErr}
					placeholder="0.00"
					onChange={ev => {
						onAmountChange(ev.target.value)
					}}
					helperText={amountErr ? amountErrText : null}
				/>
				<Box mt={1}>
					<Button
						fullWidth
						size="small"
						id={`new-farm-${actionName}-form-max-amount-btn`}
						onClick={() => {
							onAmountChange(formatTokens(maxAmount, depositAssetDecimals))
						}}
					>
						{t("common.maxAmountBtn", {
							amount: formatADXPretty(maxAmount),
							currency: depositAssetName
						})}
					</Button>
				</Box>
			</Box>
			<Box>
				{showRewards && (
					<Box my={2}>
						<Alert variant="filled" severity="info">
							{t("farm.withdrawRewardsAlert", {
								pendingADX: formatADXPretty(pendingADX),
								depositAssetName
							})}
						</Alert>
					</Box>
				)}

				{showRewardsOnDeposit && (
					<Box my={2}>
						<Alert variant="filled" severity="info">
							{t("farm.depositRewardsAlert", {
								pendingADX: formatADXPretty(pendingADX),
								depositAssetName
							})}
						</Alert>
					</Box>
				)}

				<FarmPoolData
					pollStatsLoaded={true}
					userStatsLoaded={true}
					pool={pool}
					stats={stats}
					blockNumber={blockNumber}
				/>
			</Box>

			{confirmationLabel && (
				<Box>
					<FormControlLabel
						style={{ userSelect: "none" }}
						label={t(confirmationLabel)}
						control={
							<Checkbox
								id={`new-${actionName}-form-tos-check`}
								checked={confirmation}
								onChange={ev => setConfirmation(ev.target.checked)}
							/>
						}
					></FormControlLabel>
				</Box>
			)}
			<Box>
				<Box>
					<Tooltip title={withdraw ? disableWithdrawMsg : disableDepositsMsg}>
						<Box>
							<Button
								id={`new-${actionName}-farm-btn-${toIdAttributeString(
									pool.poolId
								)}`}
								disableElevation
								fullWidth
								disabled={
									withdraw ? !!disableWithdrawMsg : !!disableDepositsMsg
								}
								color="primary"
								variant="contained"
								onClick={() => onAction(actionAmount)}
							>
								{withdraw
									? t("common.withdrawCurrency", { currency: depositAssetName })
									: t("common.depositCurrency", { currency: depositAssetName })}
							</Button>
						</Box>
					</Tooltip>
				</Box>

				{showRewards && (
					<Box mt={1}>
						<Tooltip title={disableRewardsWithdrawMsg}>
							<Box>
								<Button
									id={`new-reward-only-withdraw-farm-btn-${toIdAttributeString(
										pool.poolId
									)}`}
									disableElevation
									fullWidth
									disabled={!!disableRewardsWithdrawMsg}
									color="secondary"
									variant="contained"
									onClick={onRewardsWithdraw}
								>
									{t("farm.withdrawRewardsBtn", { token: "ADX" })}
								</Button>
							</Box>
						</Tooltip>
					</Box>
				)}
			</Box>
		</Box>
	)
}
