import React from "react"
import PropTypes from "prop-types"
import { AppBar, Toolbar, IconButton, Box, Hidden } from "@material-ui/core"
import { MenuSharp as MenuIcon } from "@material-ui/icons"
import { Help } from "./HelperMenu"
import { Wallet } from "./WalletMenu"
import LangSelect from "./LangSelect"
import ThemeSwitch from "./ThemeSwitch"
import { styles } from "./rootStyles"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(styles)

export const AppToolbar = ({ handleDrawerToggle }) => {
	const classes = useStyles()

	return (
		<AppBar elevation={0} color="transparent" position="static">
			<Toolbar className={classes.toolbar}>
				<Hidden mdUp>
					<Box>
						<IconButton
							id="mobile-burger-btn"
							color="secondary"
							aria-label="open drawer"
							onClick={handleDrawerToggle}
						>
							<MenuIcon />
						</IconButton>
					</Box>
				</Hidden>
				<Box
					className={classes.toolbarActions}
					flex="1"
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="flex-end"
					flexWrap="wrap"
				>
					<Box mr={2}>
						<LangSelect />
					</Box>
					<Box mr={2}>
						<ThemeSwitch />
					</Box>
					<Box mr={2}>
						<Help />
					</Box>
					<Box>
						<Wallet />
					</Box>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

AppToolbar.propTypes = {
	handleDrawerToggle: PropTypes.func.isRequired
}
