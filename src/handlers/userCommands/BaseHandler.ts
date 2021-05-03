import { Message,
	MessageEmbed
} from 'discord.js'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { Permission } from '../../enums'
import { Logger } from '../../Logger'
import { IHandler } from './.'

export abstract class BaseHandler implements IHandler {
	private nextHandler!: IHandler
	protected mongoConnector: MongoConnector
	protected logger: Logger
	public readonly cmdWord: string
	protected readonly prefix: string
	protected readonly img: string
	protected readonly cmd: string

	constructor(logger: Logger, mongoConnector: MongoConnector, config: Config, cmd: string) {
		this.logger = logger
		this.mongoConnector = mongoConnector
		this.cmdWord = cmd
		this.prefix = config.prefix
		this.img = config.img
		this.cmd = this.prefix + this.cmdWord
	}

	protected abstract process(message: Message): void
	public abstract fillEmbed(embed: MessageEmbed): void

	public setNext(handler: IHandler): IHandler {
		this.nextHandler = handler
		return handler
	}

	public handle(message: Message): void {
		const content = message.content.toLocaleLowerCase()
		if (content.startsWith(this.cmd.toLocaleLowerCase()) && this.hasPermissions(message)) {
			this.process(message)
			this.deleteIfModerated(message)
				.catch(reason => this.logger.logError(this.constructor.name, this.handle.name, reason))
			return
		}
		if (this.nextHandler) return this.nextHandler.handle(message)

		this.deleteIfModerated(message)
			.catch(reason => this.logger.logError(this.constructor.name, this.handle.name, reason))
	}

	protected async deleteIfModerated(message: Message): Promise<void> {
		if (!message.guild?.id) return

		const lfgChannel = await this.mongoConnector.lfgChannelRepository.get(message.guild.id, message.channel.id)
		if(lfgChannel?.moderate) this.deleteCommandMessage(message)
	}

	protected deleteCommandMessage(message: Message): void {
		message.delete()
			.catch(reason => this.logger.logError(this.constructor.name, this.handle.name, reason))
	}

	protected hasPermissions(message: Message): boolean {
		return message.member !== null && message.member.hasPermission([Permission.manageChannels, Permission.sendMessages, Permission.viewChannel], { checkAdmin: true, checkOwner: true})
	}

	protected splitArguments(message: string): string[] {
		return message.replace(/\s+/g, ' ').trim().split(' ')
	}

	protected trimCommand(message: Message): string {
		return message.content.substring(this.cmd.length + 1)
	}

	protected trimMentionMarkers(id: string): string {
		return id.substring(2, id.length-1)
	}
}