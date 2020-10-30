import React, { Fragment } from "react"
import { Box } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { InfoSharp as InfoIcon } from "@material-ui/icons"
import Tooltip from "./Tooltip"

const ExtraLabel = ({ label = "" }) =>
	Array.isArray(label) ? (
		<Fragment>
			{label.map((x, index) => (
				<Typography
					key={index}
					display="block"
					variant="caption"
					color="inherit"
				>
					{x}
				</Typography>
			))}
		</Fragment>
	) : (
		label
	)

export function Info({ title }) {
	return (
		<Tooltip title={<ExtraLabel label={title} />}>
			<InfoIcon fontSize="inherit" />
		</Tooltip>
	)
}

function AmountTextSingle({ text = "", fontSize, multiline }) {
	const decimalSeparatorSplit = text.split(".")

	if (decimalSeparatorSplit.length > 1) {
		const decimalsSplit = decimalSeparatorSplit[1].split(" ")
		const rest = decimalsSplit.slice(2)
		return (
			<Box component="div" display={multiline ? "block" : "inline"}>
				<Box component="div" display="inline">
					{decimalSeparatorSplit[0]}
					{"."}
				</Box>
				<Box
					component="div"
					display="inline"
					style={{ opacity: "0.56" }}
					fontSize={fontSize * 0.8}
				>
					{decimalsSplit[0]}
				</Box>
				{decimalsSplit[1] && (
					<Box component="div" display="inline" fontSize={fontSize * 0.8}>
						{" "}
						{decimalsSplit[1]}
					</Box>
				)}
				{!!rest.length && (
					<Box component="div" display="inline">
						{" "}
						{rest.join(" ")}
					</Box>
				)}
			</Box>
		)
	} else {
		return text
	}
}

export function AmountText({ text = "", fontSize, multiline }) {
	const multipleAmountsSplit = text
		.split(";")
		.map(x => x.trim())
		.filter(x => !!x)

	return (
		<Fragment>
			{multipleAmountsSplit
				.map((x, i) => (
					<AmountTextSingle
						key={i + x.toString()}
						text={x}
						fontSize={fontSize}
						multiline={multiline}
					/>
				))
				.reduce((prev, curr) => [prev, multiline ? null : "; ", curr])}
		</Fragment>
	)
}

export function CardRow({
	text,
	infoText,
	fontWeight,
	fontSize,
	color,
	justify,
	isAmountText,
	multilineLinesAmounts,
	...restBox
}) {
	return (
		<Box {...restBox}>
			<Typography component="div" variant="body2">
				<Box
					color={color}
					fontWeight={fontWeight}
					fontSize={fontSize}
					display="flex"
					flexDirection="row"
					alignItems="center"
					flexWrap="wrap"
					justifyContent={justify || "flex-start"}
				>
					<Box style={{ wordBreak: "break-word" }}>
						{isAmountText ? (
							<AmountText
								text={text}
								fontSize={fontSize}
								multiline={multilineLinesAmounts}
							/>
						) : (
							text
						)}
					</Box>
					{infoText && (
						<Box ml={0.69} display="flex">
							<Info title={infoText} />
						</Box>
					)}
				</Box>
			</Typography>
		</Box>
	)
}

export function PropRow({ name, value }) {
	return (
		<Box display="flex" flexDirection="row" mb={2}>
			<Box
				width={130}
				mr={2}
				color="primary.main"
				textAlign="right"
				flexShrink={0}
			>
				{name}
			</Box>
			<Box>{value}</Box>
		</Box>
	)
}
