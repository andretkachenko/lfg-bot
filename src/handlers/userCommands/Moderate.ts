import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js'
import { BaseHandler } from './BaseHandler'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { Constants } from '../../descriptor'
import { LfgChannel } from '../../entities'
import { BotCommand } from '../../enums'
import { Logger } from '../../Logger'
import { TypeGuarder } from '../../services'
import { IHandler } from './IHandler'

@IHandler.register
export class Moderate extends BaseHandler {
	private readonly flagOption = 'enable'
	private readonly idOption = 'lfgchannel'
	constructor(client: Client, logger: Logger, config: Config, mongoConnector: MongoConnector) {
		super(client, logger, config, mongoConnector, BotCommand.moderate)

		this.slash
			.setDescription('Enable/disable moderation of the lfg channels')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator || PermissionFlagsBits.ManageChannels)
			.addBooleanOption(o =>
				o
					.setName(this.flagOption)
					.setDescription(`Delete every message except events and emotions except ${Constants.acceptEmote} and ${Constants.declineEmote}?`)
					.setRequired(true)
			)
			.addChannelOption(o =>
				o
					.setName(this.idOption)
					.setDescription('LFG Channel, for which it should be changed')
					.setRequired(true))
	}

	public process(interaction: ChatInputCommandInteraction): void {
		const flag = interaction.options.getBoolean(this.flagOption)
		const channel = interaction.options.getChannel(this.idOption)

		if(flag === null) {
			interaction.reply('Invalid channel or moderation value')
				.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason as string))
			return
		}

		if(TypeGuarder.isGuildChannel(channel))
			this.updateModerationOption(channel.guild.id, flag, channel.id)


		super.process(interaction)
	}

	private updateModerationOption(guildId: string, moderate: boolean, channelId: string): void {
		const lfgChannel: LfgChannel = {
			guildId,
			channelId
		}
		this.mongoConnector.lfgChannelRepository.setModeration(lfgChannel, moderate)
			.catch(reason => this.logger.logError(this.constructor.name, this.updateModerationOption.name, reason as string))
	}

	public fillEmbed(embed: EmbedBuilder): void {
		embed
			.addFields({
				name: `${this.cmd} [True/False] #channel`,
				value: ` Enable/disable moderation of the lfg channels. If moderation is enabled on LFG channel, the bot will delete every message exept event and will delete emotions exept predefined ones.
				Requires user to have admin/owner rights or permissions to manage channels.`
			})
	}
}