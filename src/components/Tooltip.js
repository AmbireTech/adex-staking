import React from "react"
import { Tooltip } from "@material-ui/core"

/**
 *
 * @param {import("@material-ui/core").TooltipProps} param0
 * @returns {}
 */
const CommonTooltip = ({ children, ...props }) => (
	<Tooltip
		leaveTouchDelay={16900}
		enterTouchDelay={420}
		{...props}
		{...(!props.title
			? {
					disableFocusListener: true,
					disableHoverListener: true,
					disableTouchListener: true
			  }
			: {})}
	>
		{children}
	</Tooltip>
)

export default CommonTooltip
