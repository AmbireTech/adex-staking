import { Button, makeStyles } from "@material-ui/core"
import clsx from "clsx"
import { alpha } from "@material-ui/core/styles"

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
	const useStyles = makeStyles(theme => {
		const getColorWithOpacity = bgColor => alpha(bgColor, 0.5)
		return {
			common: {
				padding: "0 20px",
				fontSize: "18px",
				fontFamily: "inherit",
				borderRadius: radius ? "20px" : "",
				minWidth: "40px",
				width: w || "auto",
				height: h || "40px",
				[theme.breakpoints.down("sm")]: {
					lineHeight: "1",
					padding: "5px 20px"
				}
			},
			disabled: {
				cursor: "default",
				pointerEvents: "none",
				BorderColor: "#f3f3f3",
				boxShadow: "none",
				color: theme.palette.primary.contrastText
			},
			primary: {
				background: theme.palette.button.primary,
				color: theme.palette.primary.contrastText,
				"&$disabled": {
					background: getColorWithOpacity(theme.palette.button.primary),
					color: theme.palette.primary.contrastText
				},
				"&:hover": {
					background: getColorWithOpacity(theme.palette.button.primary)
				}
			},
			secondary: {
				background: theme.palette.button.secondary,
				color: theme.palette.primary.contrastText,
				"&$disabled": {
					background: getColorWithOpacity(theme.palette.button.secondary),
					color: theme.palette.primary.contrastText
				},
				"&:hover": {
					background: getColorWithOpacity(theme.palette.button.secondary)
				}
			},
			outline: {
				color: theme.palette.button.secondary,
				border: `2px solid ${theme.palette.button.secondary}`,
				fontWeight: "500",
				"&$disabled": {
					background: "#d1d1d160",
					borderColor: "#b1b1b160"
				},
				"&:hover": {
					background: getColorWithOpacity("#ccc")
				}
			},
			icon: {
				padding: 0,
				"&$disabled": {
					background: "#d1d1d160"
				}
			}
		}
	})

	const classes = useStyles()
	return (
		<Button
			{...rest}
			disabled={disabled}
			className={clsx(classes.common, classes[btnType], {
				[classes.disabled]: disabled
			})}
		>
			{children}
		</Button>
	)
}

export default CustomButton
