import { Client, Interaction, ActivityType } from 'discord.js'
import { Logger } from './Logger'
import { IHandler, ServerHandler } from './handlers'

export class EventRegistry {
	private client: Client
	private logger: Logger
	private serverHandlers: ServerHandler
	private handlers: Map<string, IHandler>

	constructor(client: Client) {
		this.client = client
		this.logger = new Logger()
		this.serverHandlers = new ServerHandler(this.logger)
		this.handlers = new Map()
	}

	public setCommands(handlers: Map<string, IHandler>): void {
		this.handlers = handlers
	}

	public registerEvents(): void {
		// set bot status
		this.client.once('ready', () => {
			this.logger.logEvent(`Logged in as ${this.client.user?.tag ?? ''}`)

			this.client.user?.setActivity({
				name: `${this.client.guilds.cache.size} servers`,
				type: ActivityType.Watching
			})
		})

		// handle slash commands
		this.client.on('interactionCreate', (interaction: Interaction) => {
			if(interaction.isModalSubmit()) {
				this.serverHandlers.print(interaction)
					.catch(reason => this.logger.logError(this.constructor.name, this.registerEvents.name, reason as string))
				return
			}

			if(!interaction.isChatInputCommand() || this.client.application?.commands.resolve(interaction.commandName)) return

			const handler = this.handlers.get(interaction.commandName)
			handler?.process(interaction)
		})

		// handle any problems
		process.on('exit', () => {
			this.logger.logEvent('Process exit')
			this.client.destroy()
				.catch(reason => this.logger.logError(this.constructor.name, this.registerEvents.name, reason as string))
		})

		process.on('uncaughtException', (error: Error) => this.handleError(error))
		process.on('unhandledRejection', (error: Error) => this.handleError(error))

		this.client.on('error', (error: Error) => this.handleError(error))
		this.client.on('warn', (warning) => this.logger.logWarn(warning))
	}

	private handleError(err: Error) {
		const errorMsg = (err ? err.stack || err : '').toString().replace(new RegExp(`${__dirname}\/`, 'g'), './')
		this.logger.logError(this.constructor.name, this.handleError.name, errorMsg)
	}
}