import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		"& .MuiOutlinedInput-root": {
			backgroundColor: theme.palette.background.default,
			borderRadius: "5px",
			"& fieldset": {
				borderColor: "transparent"
			},
			"&:hover fieldset": {
				borderColor: "transparent"
			},
			"&.Mui-focused fieldset": {
				borderColor: "transparent"
			}
		},
		"& .MuiInputBase-input": {
			color: theme.palette.text.secondary,
			fontSize: "16px",
			padding: "10px 14px"
		},
		"& .MuiInputLabel-root": {
			color: theme.palette.text.secondary
		}
	}
}))

const CustomTextField = () => {
	const classes = useStyles()

	return (
		<TextField
			className={classes.root}
			variant="outlined"
			placeholder="Enter your e-mail"
			InputLabelProps={{ shrink: false }} // Hide the label when placeholder is present
		/>
	)
}

export default CustomTextField
