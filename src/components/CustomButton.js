import { ButtonBase, makeStyles } from "@material-ui/core"
import clsx from "clsx"

/**
 * @param {{btnType: 'primary' | 'secondary' | 'outline' | 'icon', radius: boolean, disabled: boolean, w: string, h: string}} param0
 * @returns
 */
const CustomButton = ({
	btnType = "primary",
	radius = true,
	disabled,
	w,
	h,
	children,
	...rest
}) => {
	const useStyles = makeStyles(theme => ({
		common: {
			padding: "0 20px",
			fontSize: "18px",
			fontFamily: "inherit",
			borderRadius: radius ? "20px" : "",
			minWidth: "40px",
			width: w || "auto",
			height: h || "40px"
		},
		disabled: {
			cursor: "default",
			pointerEvents: "none",
			color: "rgba(0, 0, 0, 0.26)",
			boxShadow: "none",
			background: "rgba(0, 0, 0, 0.12)"
		},
		primary: {
			background: theme.palette.button.primary,
			color: theme.palette.primary.contrastText
		},
		secondary: {
			background: theme.palette.button.secondary,
			color: theme.palette.primary.contrastText
		},
		outline: {
			color: theme.palette.button.secondary,
			border: `2px solid ${theme.palette.button.secondary}`,
			fontWeight: "500"
		},
		icon: {
			padding: 0
		}
	}))

	const classes = useStyles()
	return (
		<ButtonBase
			{...rest}
			className={clsx(classes.common, classes[disabled ? "disabled" : btnType])}
		>
			{children}
		</ButtonBase>
	)
}

export default CustomButton
