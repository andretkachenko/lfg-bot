import { Message,
	MessageEmbed
} from 'discord.js'
import { Config } from '../../Config'
import { Messages } from '../../descriptor'
import { BotCommand } from '../../enums'
import { Logger } from '../../Logger'
import { BaseHandler } from './BaseHandler'
import { MongoConnector } from '../../db'

export class Setup extends BaseHandler {
	constructor(logger: Logger, mongoConnector: MongoConnector, config: Config) {
		super(logger, mongoConnector, config, BotCommand.setup)
	}

	protected process(message: Message): void {
		this.setupLfgChannel(message)
			.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason))
	}

	private async setupLfgChannel(message: Message) {
		if (!message.guild?.id) return
		let lfgChannel = await this.mongoConnector.lfgChannelRepository.get(message.guild.id, message.channel.id)
		if(lfgChannel) return // if already an lfg channel - no need to proceed

		lfgChannel = {
			guildId: message.guild.id,
			channelId: message.channel.id,
			moderate: true
		}
		await this.mongoConnector.lfgChannelRepository.insert(lfgChannel)
		message.channel.send(Messages.channelSetupSuccess)
			.catch(reason => this.logger.logError(this.constructor.name, this.setupLfgChannel.name, reason))
	}

	public fillEmbed(embed: MessageEmbed): void {
		embed
			.addField(`${this.cmd}`, `
            Make this channel an lfg channel. 
            These commands are only available in lfg channel:
            - ${this.prefix+BotCommand.ignore}
            - ${this.prefix+BotCommand.start}
            
            Requires user to have admin/owner rights or permissions to manage channels.
        `)
	}
}