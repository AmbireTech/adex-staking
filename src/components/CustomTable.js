import {
	Table,
	TableCell,
	TableHead,
	TableContainer,
	styled
} from "@material-ui/core"
import React from "react"

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
	marginTop: theme.spacing(2),
	boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
	borderRadius: "10px",
	overflowX: "auto" // Enable horizontal scrolling
}))

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
	borderBottom: `1px solid ${theme.palette.divider}`,
	padding: theme.spacing(1),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2)
}))

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
	background: theme.palette.background.darkerPaper,
	color: theme.palette.text.secondaryLight,
	"& th": {
		padding: theme.spacing(1),
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2)
	}
}))

/**
 * if perPage is set to -1, all data is shown on single page
 * @param {{pagination: {page: number, perPage: -1 | number}}} param0
 * @returns
 */
const CustomTable = ({
	pagination = { perPage: 10, page: 0 },
	width,
	children
}) => (
	<StyledTableContainer style={{ width: width || "100%" }}>
		<Table>{children}</Table>
	</StyledTableContainer>
)

export default CustomTable
