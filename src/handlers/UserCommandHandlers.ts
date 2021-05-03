import {
	Client,
	Message
} from 'discord.js'
import { MongoConnector } from '../db/MongoConnector'
import {
	BaseHandler,
	Help,
	Ignore,
	IHandler,
	Moderate,
	Ping,
	Setup,
	Start,
} from './userCommands'
import { Config } from '../Config'
import { Logger } from '../Logger'

export class UserCommandHandlers {
	private readonly cmdHandlingChain: IHandler
	private readonly docs: Record<string, IHandler>

	constructor(client: Client, logger: Logger, mongoConnector: MongoConnector, config: Config) {

		const handlers: BaseHandler[] = [
			new Ignore(logger, mongoConnector, config),
			new Help(logger, mongoConnector, config, this),
			new Ping(logger, mongoConnector, config),
			new Moderate(logger, mongoConnector, config),
			new Setup(logger, mongoConnector, config),
			new Start(logger, mongoConnector, config, client),
		]
		this.cmdHandlingChain = this.chain(handlers)
		this.docs = {}
		handlers.forEach(handler => this.docs[handler.cmdWord.toLocaleLowerCase()] = handler)
	}

	public handle(message: Message): void {
		if (message.author.bot) return
		this.cmdHandlingChain.handle(message)
	}

	public getDocHandler(type: string): IHandler {
		return this.docs[type.toLocaleLowerCase()]
	}

	private chain(handlers: IHandler[]): IHandler {
		let current: IHandler | undefined
		for(const handler of handlers) {
			current = this.chainHandlers(current, handler)
		}

		return handlers[0]
	}

	private chainHandlers(current: IHandler | undefined, handler: IHandler) {
		if (current)
			current.setNext(handler)
		current = handler
		return current
	}
}