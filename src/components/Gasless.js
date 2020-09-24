import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import clsx from "clsx"
import { Box, SvgIcon, Typography, IconButton } from "@material-ui/core"
import { FileCopySharp as CopyIcon } from "@material-ui/icons"
import copy from "copy-to-clipboard"
import { ReactComponent as GaslessIcon } from "./../resources/gasless-ic.svg"
import SectionHeader from "./SectionHeader"
import AppContext from "../AppContext"

const useStyles = makeStyles(theme => {
	return {
		overlay: {
			position: "absolute",
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "transparent"
		},
		noUserData: {
			opacity: 0.23
		},
		address: {
			wordBreak: "break-all"
		}
	}
})

const Gasless = () => {
	const classes = useStyles()

	const { stats, setConnectWallet, addSnack } = useContext(AppContext)

	return (
		<Box>
			<SectionHeader title={"Gasless Staking"} />
			<Box>
				<Box
					className={clsx({
						[classes.noUserData]: !stats.connectedWalletAddress
					})}
				>
					<Box mt={4} color="text.main" fontSize={88}>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
						<SvgIcon color="inherit" fontSize="inherit">
							<GaslessIcon width="100%" height="100%" color="secondary" />
						</SvgIcon>
					</Box>
					<Box
						mt={4}
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
					>
						<Box>
							<Typography component="div" variant="body2">
								{"Gasless account address"}
							</Typography>
						</Box>
						<Box
							mt={2}
							bgcolor="background.paper"
							color="text.main"
							fontSize={23}
							display="flex"
							flexDirection="row"
							alignItems="center"
							justifyContent="flex-start"
							flexGrow={0}
							flexWrap="wrap"
						>
							<Box m={1} ml={2} classes={{ root: classes.address }}>
								{stats.identityAddr}
							</Box>
							<Box m={1}>
								<IconButton
									id="mobile-burger-btn"
									color="secondary"
									aria-label="open drawer"
									onClick={() => {
										copy(stats.identityAddr)
										addSnack(
											`Gasless Staking address ${stats.identityAddr} copied to clipboard`,
											"success"
										)
									}}
								>
									<CopyIcon />
								</IconButton>
							</Box>
						</Box>
					</Box>
				</Box>

				{!stats.connectedWalletAddress && (
					<Box
						id="side-nav-connect-wallet-overlay"
						classes={{ root: classes.overlay }}
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						color="secondary.main"
						bgcolor="transparent"
						fontSize="h1.fontSize"
						textAlign="center"
						onClick={() => setConnectWallet(true)}
						style={{ cursor: "pointer" }}
					>
						{"CONNECT WALLET"}
					</Box>
				)}
			</Box>
		</Box>
	)
}

export default Gasless
