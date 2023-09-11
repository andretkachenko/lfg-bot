import * as dotenv from 'dotenv'

export class Config {
	applicationId: string
	token: string
	testServer: string
	img: string

	constructor() {
		dotenv.config()
		this.applicationId = process.env.APPLICATION_ID as string
		this.token = process.env.TOKEN as string
		this.testServer = process.env.TEST_SERVER as string
		this.img = process.env.IMG as string
	}
}