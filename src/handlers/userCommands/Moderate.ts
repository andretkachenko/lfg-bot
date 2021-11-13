import { Message,
	MessageEmbed
} from 'discord.js'
import { BaseHandler } from './BaseHandler'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { Constants } from '../../descriptor'
import { LfgChannel } from '../../entities'
import { BotCommand } from '../../enums'
import { Logger } from '../../Logger'

export class Moderate extends BaseHandler {
	constructor(logger: Logger, mongoConnector: MongoConnector, config: Config) {
		super(logger, mongoConnector, config, BotCommand.moderate)
	}

	protected process(message: Message): void {
		const args = this.splitArguments(this.trimCommand(message))
		const guildId = message.guild?.id as string
		const moderate = args[0] === Constants.enable
		for (let i = 1; i < args.length; i++) {
			this.updateModerationOption(guildId, moderate, this.trimMentionMarkers(args[i]))
		}
	}

	private updateModerationOption(guildId: string, moderate: boolean, channelId: string): void {
		const lfgChannel: LfgChannel = {
			guildId,
			channelId
		}
		this.mongoConnector.lfgChannelRepository.setModeration(lfgChannel, moderate)
			.catch(reason => this.logger.logError(this.constructor.name, this.updateModerationOption.name, reason))
	}

	public fillEmbed(embed: MessageEmbed): void {
		embed
			.addField(`${this.cmd} [0/1] #channel`, `
			Enable/disable moderation of the lfg channels. If moderation is enabled on LFG channel, the bot will delete every message exept event and will delete emotions exept predefined ones.
            \`1\` means that moderation should be enabled for the channel, \`0\` - disabled.
			\`1\` is the default option for the LFG channels.
			Supports arguments chaining - you're allowed to mention more than 1 channel.

            Examples:
            \`${this.cmd} 1 #lfg\` - request to enable moderation for the #lfg channel
            \`${this.cmd} 0 #lfg\` - request to disable moderation for the #lfg channel

            Requires user to have admin/owner rights or permissions to manage channels.
		`)
	}
}