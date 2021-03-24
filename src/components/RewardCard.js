import React from "react"
import { Button } from "@material-ui/core"

import WithRouterLink from "./WithRouterLink"
import { useTranslation } from "react-i18next"
import WithDialog from "./WithDialog"
import MigrationForm from "./MigrationForm"
import { MIGRATION_UNBOND_BEFORE, ZERO } from "../helpers/constants"
import { getPool } from "../helpers/bonds"

const MigrationDialog = WithDialog(MigrationForm)

const RRButton = WithRouterLink(Button)

export default function RewardCard({ userBonds }) {
	const { t } = useTranslation()

	const migratableBonds = [...userBonds].filter(
		x => x.status !== "Unbonded" && x.status !== "Migrated"
	)

	if (!migratableBonds.length) {
		return null
	}

	if (migratableBonds.length > 1) {
		return (
			<RRButton
				fullWidth
				to={{ pathname: "/stakings" }}
				color="primary"
				variant="contained"
			>
				{t("rewards.migrateYourBondsIfYouWandMigrate")}
			</RRButton>
		)
	}

	const bond = migratableBonds.length > 1 ? migratableBonds[0] : null
	const isWithdrawMigration =
		bond &&
		bond.status === "UnbondRequested" &&
		bond.willUnlock &&
		bond.willUnlock.getTime() < MIGRATION_UNBOND_BEFORE

	console.log("isWithdrawMigration", isWithdrawMigration)

	if (bond) {
		const pool = getPool(bond.poolId)
		const poolLabel = pool ? pool.label : bond.poolId
		const created = new Date(
			(bond.nonce.gt(ZERO) ? bond.nonce : bond.time).toNumber() * 1000
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
				bond={bond}
				poolLabel={poolLabel}
				created={created}
				fullWidth
				isWithdrawMigration={isWithdrawMigration}
			/>
		)
	} else {
		return null
	}
}
