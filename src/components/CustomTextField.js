import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		"& .MuiOutlinedInput-root": {
			backgroundColor: theme.palette.background.darkerPaper,
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
			fontSize: "18px",
			padding: "10px 14px",
			color: theme.palette.text.secondary
		}
	}
}))

const CustomTextField = ({ label, ...rest }) => {
	const classes = useStyles()

	return (
		<TextField
			{...rest}
			className={classes.root}
			variant="outlined"
			placeholder={label}
			InputLabelProps={{ shrink: false }} // Hide the label when placeholder is present
		/>
	)
}

export default CustomTextField
