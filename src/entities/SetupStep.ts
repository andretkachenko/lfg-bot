type Validation = (response: string | undefined) => boolean

export class SetupStep {
	question: string
	warning: string
	required: boolean
	private validation: Validation

	constructor(question: string, warning: string, validation: Validation, required: boolean) {
		this.question = question
		this.warning = warning
		this.validation = validation
		this.required = required
	}

	public skipped(response: string | undefined): boolean {
		return response && response === 'skip' ? true : false
	}

	public validate(response: string | undefined): boolean {
		if (this.validation) return this.validation(response)
		else return true
	}
}