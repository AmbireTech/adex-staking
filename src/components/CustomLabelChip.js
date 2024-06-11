import { Chip, alpha, styled } from "@material-ui/core"

const statusToClass = ["error", "success", "warning"]

/**
 * Status: 0 - Red; 1 - Green; 2 - Yellow
 * @param {{status: 0 | 1 | 2}}} param0
 */
const CustomLabelChip = ({ status = 1, label, ...rest }) => {
	const StyledChip = styled(Chip)(({ theme }) => ({
		fontSize: "14px",
		minWidth: "200px",
		padding: "1px",
		justifyContent: "flex-start",
		height: "fit-content",
		borderWidth: "1px",
		borderStyle: "solid",
		backgroundColor: alpha(theme.palette[statusToClass[status]].main, 0.1),
		borderColor: theme.palette[statusToClass[status]].main,
		color: theme.palette[statusToClass[status]].main
	}))

	return <StyledChip label={label} {...rest} /> // Pass children here
}

export default CustomLabelChip
