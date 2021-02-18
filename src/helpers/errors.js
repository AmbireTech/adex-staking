export class TranslatableError extends Error {
	constructor(message, values) {
		super(message)
		this.values = values
	}
}
