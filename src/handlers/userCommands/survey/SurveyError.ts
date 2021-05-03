export class SurveyError extends Error {
	constructor(m: string) {
		super(m)

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, SurveyError.prototype)
	}
}