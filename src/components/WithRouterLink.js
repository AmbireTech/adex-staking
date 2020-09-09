import React, { forwardRef } from "react"
import { withRouter } from "react-router-dom"

const WithRouterLink = Component => {
	const Decorated = props => {
		const resolveToLocation = to => {
			const path = typeof to === "object" ? to : { pathname: to }
			const href = props.history.createHref(path)
			return href
		}

		const handleClick = async event => {
			event.preventDefault()
			event.stopPropagation()
			const { to, onClick } = props

			if (onClick && typeof onClick === "function") {
				await onClick()
				props.history.push(to)
			} else {
				props.history.push(to)
			}
		}

		const {
			forwardedRef,
			to,
			match,
			location,
			history,
			staticContext,
			onClick,
			...rest
		} = props
		const toLocation = resolveToLocation(to)

		return (
			<Component
				ref={forwardedRef}
				{...rest}
				href={toLocation}
				onClick={handleClick}
			/>
		)
	}

	const WithRouter = withRouter(Decorated)

	return forwardRef((props, ref) => (
		<WithRouter {...props} forwardedRef={ref} />
	))
}

export default WithRouterLink
