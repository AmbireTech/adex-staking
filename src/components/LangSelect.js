import React from "react"
import { Button, Menu, MenuItem, SvgIcon } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { ReactComponent as GlobeIcon } from "./../resources/globe_icon.svg"

const locales = {
	en: {
		value: "en",
		label: "English"
	},
	ko: {
		value: "ko",
		label: "한국어"
	},
	zh: {
		value: "zh",
		label: "简体中文"
	}
}

export default function LangSelect() {
	const { i18n } = useTranslation()
	const [anchorEl, setAnchorEl] = React.useState(null)

	const { language } = i18n

	const handleClick = event => {
		setAnchorEl(event.currentTarget)
	}

	return (
		<div>
			<Button
				aria-controls="lang-select-menu"
				aria-haspopup="true"
				onClick={handleClick}
				style={{ textTransform: "capitalize" }}
			>
				<SvgIcon style={{ marginRight: "5px", opacity: 0.8 }}>
					<GlobeIcon />
				</SvgIcon>
				{(locales[language] || {}).value || "en"}
			</Button>
			<Menu
				id="lang-select-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
			>
				{Object.values(locales).map(({ label = "", value = "" }) => (
					<MenuItem
						id={`lang-select-menu-${value}`}
						key={value}
						onClick={() => {
							i18n.changeLanguage(value)
							setAnchorEl(null)
						}}
					>
						{label}
					</MenuItem>
				))}
			</Menu>
		</div>
	)
}
