/* eslint-disable no-console */
export class Logger {
	public logEvent(message: string): void {
		console.log(message)
	}

	public logError(className: string, methodName: string, message: string, ...parameters: string[]): void {
		console.log(`[ERR] ${className}.${methodName}(${parameters.length > 0 ? parameters.join(', ') : ''}) - ${message}`)
	}

	public logWarn(message: string): void {
		console.log(`[WAR] ${message}`)
	}
}