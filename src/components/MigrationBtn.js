import React, { useContext } from "react"
import { Button, Fab } from "@material-ui/core"

import WithRouterLink from "./WithRouterLink"
import { useTranslation } from "react-i18next"
import WithDialog from "./WithDialog"
import MigrationForm from "./MigrationForm"
import AppContext from "../AppContext"
import { ZERO } from "../helpers/constants"
import { getPool } from "../helpers/bonds"

const MigrationDialog = WithDialog(MigrationForm)

const RRButton = WithRouterLink(Button)
const RRFab = WithRouterLink(Fab)

export default function MigrationBtn({ onBeforeOpen, fabButton, color, size }) {
	const { t } = useTranslation()
	const { stats } = useContext(AppContext)

	const {
		hasToMigrate,
		bondToMigrate,
		isWithdrawMigration
	} = stats.tomBondsMigrationData

	if (!hasToMigrate) {
		return null
	}

	const ButtonComponent = fabButton ? RRFab : RRButton

	if (hasToMigrate && !bondToMigrate) {
		return (
			<ButtonComponent
				onClick={onBeforeOpen}
				to={{ pathname: "/stakings" }}
				color={color || "primary"}
				size={size || "small"}
				variant={fabButton ? "extended" : "contained"}
			>
				{t("rewards.migrateYourBondsIfYouWandMigrate")}
			</ButtonComponent>
		)
	}

	if (bondToMigrate) {
		const pool = getPool(bondToMigrate.poolId)
		const poolLabel = pool ? pool.label : bondToMigrate.poolId
		const created = new Date(
			(bondToMigrate.nonce.gt(ZERO)
				? bondToMigrate.nonce
				: bondToMigrate.time
			).toNumber() * 1000
		)

		return (
			<MigrationDialog
				id="staking-pool-tom-deposit-form"
				title={
					isWithdrawMigration ? t("bonds.unbond") : t("bonds.requestMigrate")
				}
				btnLabel={
					isWithdrawMigration ? t("bonds.unbond") : t("bonds.requestMigrate")
				}
				color={color || "primary"}
				size={size || "small"}
				variant={fabButton ? "extended" : "contained"}
				fabButton={!!fabButton}
				bond={bondToMigrate}
				poolLabel={poolLabel}
				created={created}
				fullWidth
				isWithdrawMigration={isWithdrawMigration}
				onCloseDialog={onBeforeOpen}
			/>
		)
	} else {
		return null
	}
}
