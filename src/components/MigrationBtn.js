import React, { useContext } from "react"
import { Button } from "@material-ui/core"

import WithRouterLink from "./WithRouterLink"
import { useTranslation } from "react-i18next"
import WithDialog from "./WithDialog"
import MigrationForm from "./MigrationForm"
import AppContext from "../AppContext"
import { ZERO } from "../helpers/constants"
import { getPool } from "../helpers/bonds"

const MigrationDialog = WithDialog(MigrationForm)

const RRButton = WithRouterLink(Button)

export default function MigrationBtn({ onBeforeOpen }) {
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

	if (hasToMigrate && !bondToMigrate) {
		return (
			<RRButton
				fullWidth
				onClick={onBeforeOpen}
				to={{ pathname: "/stakings" }}
				color="primary"
				variant="contained"
			>
				{t("rewards.migrateYourBondsIfYouWandMigrate")}
			</RRButton>
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
				color="primary"
				size="small"
				variant="contained"
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
