import { Messages } from '../../../descriptor'

export class AbortProcess extends Error {
	constructor() {
		super(Messages.eventAborted)

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, AbortProcess.prototype)
	}
}