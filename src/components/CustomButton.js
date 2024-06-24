import { ButtonBase, makeStyles } from "@material-ui/core"
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
		const getDisabledBgColor = bgColor => alpha(bgColor, 0.5)
		return {
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
				boxShadow: "none",
				color: theme.palette.primary.contrastText
			},
			primary: {
				background: theme.palette.button.primary,
				color: theme.palette.primary.contrastText,
				"&$disabled": {
					background: getDisabledBgColor(theme.palette.button.primary)
				}
			},
			secondary: {
				background: theme.palette.button.secondary,
				color: theme.palette.primary.contrastText,
				"&$disabled": {
					background: getDisabledBgColor(theme.palette.button.secondary)
				}
			},
			outline: {
				color: theme.palette.button.secondary,
				border: `2px solid ${theme.palette.button.secondary}`,
				fontWeight: "500",
				"&$disabled": {
					background: getDisabledBgColor(theme.palette.button.secondary)
				}
			},
			icon: {
				padding: 0
			}
		}
	})

	const classes = useStyles()
	return (
		<ButtonBase
			{...rest}
			className={clsx(classes.common, classes[btnType], {
				[classes.disabled]: disabled
			})}
		>
			{children}
		</ButtonBase>
	)
}

export default CustomButton
