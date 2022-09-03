import { Client,
	Interaction,
	ActivityType,
	Message,
	MessageReaction,
	PartialMessageReaction,
} from 'discord.js'
import { Logger } from './Logger'
import { ClientEvent } from './enums/ClientEvent'
import { ProcessEvent } from './enums/ProcessEvent'
import { MongoConnector } from './db/MongoConnector'
import {
	Messages,
	Constants
} from './descriptor'
import { LfgChannelModerator, ServerHandler } from './handlers'
import { IHandler } from './handlers/userCommands'

export class EventRegistry {
	private client: Client

	private logger: Logger
	private lfgChannelModerator: LfgChannelModerator
	private serverHandlers: ServerHandler
	private handlers: Map<string, IHandler>

	constructor(client: Client, mongoConnector: MongoConnector) {
		this.client = client
		this.logger = new Logger()

		this.serverHandlers = new ServerHandler(this.logger, mongoConnector)
		this.lfgChannelModerator = new LfgChannelModerator(this.logger, mongoConnector)
		this.handlers = new Map()
	}

	public setCommands(handlers: Map<string, IHandler>): void {
		this.handlers = handlers
	}

	public registerEvents(): void {
		// => Log bot started and listening
		this.handleReady()

		// => Main worker handlers
		this.handleInteraction()
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
			this.introduce(this.client)
		})
	}

	private handleMessage() {
		this.client.on(ClientEvent.messageCreate, (message: Message) => {
			this.lfgChannelModerator.validateMessage(message)
				.catch(reason => this.logger.logError(this.constructor.name, this.handleMessage.name, reason as string))
		})
	}

	private handleMessageReactionAdd() {
		this.client.on(ClientEvent.messageReactionAdd, (reaction: MessageReaction | PartialMessageReaction) => {
			this.lfgChannelModerator.validateReaction(reaction)
				.catch(reason => this.logger.logError(this.constructor.name, this.handleMessageReactionAdd.name, reason as string))
		})
	}

	private handleInteraction() {
		this.client.on(ClientEvent.interactionCreate, (interaction: Interaction) => {
			if(interaction.isModalSubmit()) {
				this.serverHandlers.print(interaction)
					.catch(reason => this.logger.logError(this.constructor.name, this.handleInteraction.name, reason as string))
				return
			}

			if(!interaction.isChatInputCommand() || this.client.application?.commands.resolve(interaction.commandName)) return
			interaction.deferReply()
				.then(() => {
					const handler = this.handlers.get(interaction.commandName)
					handler?.process(interaction)
				})
				.catch(reason => this.logger.logError(this.constructor.name, this.handleInteraction.name, reason as string))
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

	private introduce(client: Client): void {
		this.logger.logEvent(Messages.botConnected)
		this.logger.logEvent(Messages.loggedAs + (client.user ? client.user.tag : Constants.undefinedId))
		try
		{
			this.setBotActivity(client)
		}
		catch(error) {
			this.logger.logError(this.constructor.name, this.introduce.name, error as string)
		}
	}

	private setBotActivity(client: Client) {
		if (client.user)
			client.user.setActivity({
				name: Messages.statusString(client.guilds.cache.size),
				type: ActivityType.Watching
			})
	}
}