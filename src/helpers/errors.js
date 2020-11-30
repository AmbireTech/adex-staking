export class TranslatableError extends Error {
	constructor(message, values, severity) {
		super(message)
		this.values = values
		this.severity = severity
	}
}
