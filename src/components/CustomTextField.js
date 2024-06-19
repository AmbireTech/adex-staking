import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
	disabled: {
		backgroundColor: theme.palette.background.darkerPaper,
		"& .MuiInputBase-input": {
			color: `${theme.palette.text.secondaryLight} !important`
		},
		"& .MuiOutlinedInput-root": {
			"& fieldset": {
				borderColor: `${theme.palette.text.secondary} !important`
			}
		}
	},
	root: {
		display: "flex",
		"& .MuiOutlinedInput-root": {
			"& fieldset": {
				borderColor: theme.palette.secondary.main
			}
		},
		"& .MuiInputBase-input": {
			fontSize: "18px",
			padding: "10px 14px",
			color: theme.palette.secondary.main
		}
	}
}))

/**
 *
 * @param {import("@material-ui/core").TextFieldProps} param0
 * @returns
 */
const CustomTextField = ({ disabled, label, ...rest }) => {
	const classes = useStyles()

	return (
		<TextField
			{...rest}
			disabled={disabled}
			className={`${classes.root} ${disabled ? classes.disabled : ""}`}
			placeholder={label}
			InputLabelProps={{ shrink: false }} // Hide the label when placeholder is present
		/>
	)
}

export default CustomTextField
