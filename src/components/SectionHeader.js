import React, { useContext } from "react"
import AppContext from "../AppContext"
import { makeStyles } from "@material-ui/core/styles"
import { Box, Typography } from "@material-ui/core"
import { AddSharp as AddIcon } from "@material-ui/icons"
import { toIdAttributeString } from "../helpers/formatting"
import { useTranslation } from "react-i18next"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"
import { DEPOSIT_POOLS } from "../helpers/constants"
import { DEPOSIT_ACTION_TYPES } from "../actions"

const DepositsDialog = WithDialog(DepositForm)

const useStyles = makeStyles(theme => ({
	fabIcon: {
		marginRight: theme.spacing(1)
	}
}))

const SectionHeader = ({ title, actions }) => {
	const { t } = useTranslation()
	const classes = useStyles()

	const { stats, chosenWalletType } = useContext(AppContext)
	const canStake = !!chosenWalletType.name && !!stats.connectedWalletAddress

	return (
		<Box
			display="flex"
			flexDirection="row"
			justifyContent="space-between"
			alignItems="center"
			flexWrap="wrap"
		>
			<Box color="text.main" mb={1}>
				<Typography variant="h3" style={{ wordBreak: "break-word" }}>
					{title}
				</Typography>
			</Box>
			<Box mb={1}>
				{!!actions
					? actions
					: chosenWalletType.name && (
							<DepositsDialog
								id={`section-header-fab-stake-adx-${toIdAttributeString(
									title
								)}`}
								title={t("deposits.depositTo", {
									pool: t("common.tomStakingPool")
								})}
								btnLabel={t("bonds.stakeADX")}
								color="secondary"
								size="medium"
								variant="extended"
								fabButton
								fullWidth
								icon={<AddIcon className={classes.fabIcon} />}
								disabled={!stats.loaded || !canStake}
								tooltipTitle={t("common.connectWallet")}
								depositPool={DEPOSIT_POOLS[1].id}
								actionType={DEPOSIT_ACTION_TYPES.deposit}
							/>
					  )}
			</Box>
		</Box>
	)
}

export default SectionHeader
