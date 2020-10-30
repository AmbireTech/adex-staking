import React, { useState } from "react"
import {
	Box,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	Grid
} from "@material-ui/core"
import { POOLS } from "../helpers/constants"
import { useTranslation } from "react-i18next"

const poolsSrc = POOLS.filter(x => x.selectable).map(x => ({
	value: x.id,
	label: x.label
}))

export default function Rewards() {
	const { t } = useTranslation()
	const [pool, setPool] = useState(poolsSrc[0].value)

	return (
		<Box>
			<Box mb={2}>
				<FormControl>
					<InputLabel id="pool-stats-select-input-label">Pool</InputLabel>
					<Select
						labelId="pool-stats-select-input-labe"
						id="pool-stats-select"
						value={pool}
						onChange={e => setPool(e.target.value)}
					>
						{poolsSrc.map(({ value, label }) => (
							<MenuItem key={value} value={value}>
								{t(label)}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
			<Box>
				<Grid container>
					<Grid item md={12} lg={7}>
						<Box width={1} height={420} bgcolor="background.special">
							{"GRAPH HERE"}
						</Box>
					</Grid>
					<Grid item md={12} lg={5}></Grid>
				</Grid>
			</Box>
		</Box>
	)
}
