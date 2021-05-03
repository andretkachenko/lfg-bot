import { Client,
	DMChannel,
	Message,
	MessageAttachment,
	MessageEmbed,
	NewsChannel,
	TextChannel,
	User
} from 'discord.js'
import { Config } from '../../Config'
import { MongoConnector } from '../../db/MongoConnector'
import { Constants,
	EventMessages,
} from '../../descriptor'
import { EventOptions } from '../../entities'
import { BotCommand } from '../../enums'
import { Logger } from '../../Logger'
import { BaseHandler } from './BaseHandler'
import { Survey } from './survey'

export class Start extends BaseHandler {
	private client: Client
	private survey: Survey

	constructor(logger: Logger, mongoConnector: MongoConnector, config: Config, client: Client) {
		super(logger, mongoConnector, config, BotCommand.start)
		this.client = client
		this.survey = new Survey(logger)
	}

	protected process(message: Message): void {
		this.startLfgEvent(message)
			.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason))
	}


	private async startLfgEvent(message: Message) {
		if(!message.guild?.id) return
		const lfgChannel = await this.mongoConnector.lfgChannelRepository.get(message.guild.id, message.channel.id)
		if(!lfgChannel) return

		const channel = message.channel
		const author = message.author
		const botId = this.client.user ? this.client.user.id : Constants.emptyString

		this.survey.tryConduct(message, botId)
			.then(options => this.createEvent(options, author, channel))
			.catch(reason => this.logger.logError(this.constructor.name, this.startLfgEvent.name, reason))
	}

	private createEvent(options: EventOptions | undefined, author: User, channel: TextChannel | DMChannel | NewsChannel) {
		if (!options) return

		const event = this.createEventMessage(author, options)
		const attachments = this.gatherAttachments(options)
		channel.send(event, attachments)
			.then(msg => this.addAllowedEmotes(msg))
			.catch(reason => this.logger.logError(this.constructor.name, this.createEvent.name, reason))
	}

	private addAllowedEmotes(msg: Message) {
		msg.react(Constants.acceptEmote)
			.catch(reason => this.logger.logError(this.constructor.name, this.createEvent.name, reason))
		msg.react(Constants.declineEmote)
			.catch(reason => this.logger.logError(this.constructor.name, this.createEvent.name, reason))
	}

	private createEventMessage(author: User, options: EventOptions): string {
		let msg = EventMessages.header(author.username)
		if (options.description) msg += EventMessages.description(options.description)
		msg += EventMessages.what(options.name)
		if (options.when) msg += EventMessages.when(options.when)

		return msg
	}

	private gatherAttachments(options: EventOptions): MessageAttachment[] {
		const nameAttachments = this.getAttachments(options.name)
		const whenAttachments = this.getAttachments(options.when)
		const descriptionAttachments = this.getAttachments(options.description)

		return nameAttachments
			.concat(whenAttachments)
			.concat(descriptionAttachments)
	}

	private getAttachments(message: Message): MessageAttachment[] {
		return message ? message.attachments.array() : new Array<MessageAttachment>()
	}

	protected hasPermissions(_message: Message): boolean {
		return true
	}

	public fillEmbed(embed: MessageEmbed): void {
		embed.addField(`${this.cmd}`, `
			Start the survey to create new event in an lfg channel. 
			New temporary channel will be created, where the user will be prompted to complete survey. 
			User's answers will be collected into an embed and sent to the lfg channel.

			This command only works when triggered from an lfg channel. 
			After survey is completed, event will be created in the same lfg channel, where user triggered the command.
		`)
	}
}