import {
	ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
	PermissionFlagsBits
} from 'discord.js'
import { Config } from '../../Config'
import { Messages } from '../../descriptor'
import { BotCommand } from '../../enums'
import { Logger } from '../../Logger'
import { BaseHandler } from './BaseHandler'
import { MongoConnector } from '../../db'
import { IHandler } from './IHandler'

@IHandler.register
export class Setup extends BaseHandler {
	private readonly whatId = 'what'
	private readonly whenId = 'when'
	private readonly descriptionId = 'description'
	private readonly partySizeId = 'partysize'

	constructor(client: Client, logger: Logger, config: Config, mongoConnector: MongoConnector) {
		super(client, logger, config, mongoConnector, BotCommand.setup)

		this.slash
			.setDescription('Mark this channel as LFG channel')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator || PermissionFlagsBits.ManageChannels)
	}

	public process(interaction: ChatInputCommandInteraction): void {
		this.setupLfgChannel(interaction)
			.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason as string))
	}

	private async setupLfgChannel(interaction: ChatInputCommandInteraction) {
		if (!interaction.guildId || !interaction.channelId) return
		let lfgChannel = await this.mongoConnector.lfgChannelRepository.get(interaction.guildId, interaction.channelId)
		if (lfgChannel) return // if already an lfg channel - no need to proceed

		lfgChannel = {
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			moderate: true
		}
		await this.mongoConnector.lfgChannelRepository.insert(lfgChannel)
		interaction.reply({
			content: Messages.channelSetupSuccess,
			ephemeral: true
		})
			.catch(reason => this.logger.logError(this.constructor.name, this.setupLfgChannel.name, reason as string))
	}

	public fillEmbed(embed: EmbedBuilder): void {
		embed
			.addFields({
				name: `${this.cmd}`,
				value: `Make this channel an lfg channel. 
				These commands are only available in lfg channel:
				- /${BotCommand.ignore}
				- /${BotCommand.create}
				
				Requires user to have admin/owner rights or permissions to manage channels.`
			})
	}
}