import { Client,
	Message,
	MessageReaction
} from 'discord.js'
import { Logger } from './Logger'
import { ClientEvent } from './enums/ClientEvent'
import { ProcessEvent } from './enums/ProcessEvent'
import { Config } from './Config'
import { MongoConnector } from './db/MongoConnector'
import {
	Messages,
	Constants
} from './descriptor'
import { UserCommandHandlers } from './handlers/UserCommandHandlers'
import { LfgChannelModerator, ServerHandler } from './handlers'

export class EventRegistry {
	private client: Client
	private config: Config

	private logger: Logger
	private userCommandHandlers: UserCommandHandlers
	private lfgChannelModerator: LfgChannelModerator
	private serverHandlers: ServerHandler

	constructor(client: Client, config: Config) {
		this.client = client
		this.config = config

		this.logger = new Logger()

		const mongoConnector = new MongoConnector(config, this.logger)
		this.userCommandHandlers = new UserCommandHandlers(client, this.logger, mongoConnector, config)
		this.lfgChannelModerator = new LfgChannelModerator(this.logger, mongoConnector)
		this.serverHandlers = new ServerHandler(this.logger, mongoConnector)
	}

	public registerEvents(): void {
		// => Log bot started and listening
		this.handleReady()

		// => Main worker handlers
		this.handleMessage()
		this.handleMessageReactionAdd()
		this.handleGuildDelete()

		// => Bot error and warn handlers
		this.handleClientErrorsAndWarnings()

		// => Process handlers
		this.handleProcessEvents()
	}

	// ---------------- //
	//  Event Handlers  //
	// ---------------- //

	private handleReady() {
		this.client.once(ClientEvent.ready, () => {
			this.introduce(this.client, this.config)
		})
	}

	private handleMessage() {
		this.client.on(ClientEvent.message, (message: Message) => {
			this.userCommandHandlers.handle(message)
		})
	}

	private handleMessageReactionAdd() {
		this.client.on(ClientEvent.messageReactionAdd, (reaction: MessageReaction) => {
			this.lfgChannelModerator.validateReaction(reaction)
				.catch(reason => this.logger.logError(this.constructor.name, this.handleMessageReactionAdd.name, reason))
		})
	}

	private handleGuildDelete() {
		this.client.on(ClientEvent.guildDelete, guild => {
			this.serverHandlers.handleBotKickedFromServer(guild)
		})
	}

	private handleProcessEvents() {
		process.on(ProcessEvent.exit, () => {
			const msg = Messages.processExit
			this.logger.logEvent(msg)
			this.client.destroy()
		})

		process.on(ProcessEvent.uncaughtException, (error: Error) => this.handleError(error))

		process.on(ProcessEvent.unhandledRejection, (reason: Error) => {
			this.logger.logError(this.constructor.name, this.handleProcessEvents.name, `${Messages.unhandledRejection} : ${reason.message} ${reason.stack ? Constants.at + reason.stack : Constants.emptyString}`)
		})
	}

	private handleClientErrorsAndWarnings() {
		this.client.on(ClientEvent.error, (error: Error) => this.handleError(error))

		this.client.on(ClientEvent.warn, (warning) => {
			this.logger.logWarn(Messages.discordWarn + ': ' + warning)
		})
	}

	private handleError(err: Error) {
		const errorMsg = (err ? err.stack || err : Constants.emptyString).toString().replace(new RegExp(`${__dirname}\/`, 'g'), './')
		this.logger.logError(this.constructor.name, this.handleError.name, errorMsg)
	}

	public introduce(client: Client, config: Config): void {
		this.logger.logEvent(Messages.botConnected)
		this.logger.logEvent(Messages.loggedAs + (client.user ? client.user.tag : Constants.undefinedId))
		try
		{
			this.setBotActivity(client, config)
		}
		catch(error) {
			this.logger.logError(this.constructor.name, this.introduce.name, error)
		}
	}

	private setBotActivity(client: Client, config: Config) {
		if (client.user)
			client.user.setActivity({
				'name': Messages.statusString(config.prefix, client.guilds.cache.size),
				'type': Constants.listening
			})
				.catch(reason => this.logger.logError(this.constructor.name, this.introduce.name, reason))
	}
}