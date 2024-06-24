import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"
import clsx from "clsx"

const useStyles = makeStyles(theme => ({
	disabled: {
		backgroundColor: theme.palette.background.darkerPaper,
		"& .MuiInputBase-input": {
			color: `${theme.palette.text.secondaryLight} !important`,
			background: theme.palette.background.darkerPaper
		},
		"& .MuiOutlinedInput-root": {
			"& fieldset": {
				borderColor: `${theme.palette.text.secondary}aa !important`
			}
		}
	},
	root: {},
	outlined: {
		display: "flex",
		background: theme.palette.background.paper,
		"& .MuiOutlinedInput-root": {
			borderRadius: "5px",
			border: "none",
			"&:hover fieldset": {
				border: `2px solid ${theme.palette.secondary.main}`
			},
			"&.Mui-focused fieldset": {
				border: `2px solid ${theme.palette.secondary.main}`
			},
			"& fieldset": {
				border: `2px solid ${theme.palette.secondary.main}`
			}
		},
		"& .MuiInputBase-input": {
			fontSize: "18px",
			padding: "10px 14px",
			color: theme.palette.secondary.main,
			fontWeight: "bold"
		}
	},
	filled: {
		display: "flex",
		background: theme.palette.background.darkerPaper,
		"& .MuiFilledInput-root": {
			borderRadius: "5px",
			backgroundColor: theme.palette.background.darkerPaper,
			"&:before, &:after": {
				borderBottom: "none"
			},
			"&:hover:not(.Mui-disabled):before": {
				borderBottom: "none"
			},
			"&.Mui-focused:before": {
				borderBottom: "none"
			}
		},
		"& .MuiInputBase-input": {
			fontSize: "18px",
			padding: "10px 14px",
			color: theme.palette.text.primary
		},
		"& .MuiInputBase-input::placeholder": {
			color: theme.palette.text.secondary,
			opacity: "1"
		}
	}
}))

/**
 * @param {import("@material-ui/core").TextFieldProps} param0
 */
const CustomTextField = ({ disabled, label, variant, ...rest }) => {
	const classes = useStyles()

	return (
		<TextField
			{...rest}
			disabled={disabled}
			variant={variant}
			className={clsx(
				classes.root,
				classes[variant],
				disabled ? classes.disabled : ""
			)}
			placeholder={label}
		/>
	)
}

export default CustomTextField
