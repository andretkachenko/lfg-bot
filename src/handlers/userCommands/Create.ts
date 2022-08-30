import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder
} from '@discordjs/builders'
import {
	PermissionFlagsBits,
	TextInputStyle
} from 'discord-api-types/v10'
import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder
} from 'discord.js'
import { Config } from '../../Config'
import { MongoConnector } from '../../db/MongoConnector'
import { BotCommand } from '../../enums'
import { Logger } from '../../Logger'
import { BaseHandler } from './BaseHandler'
import { IHandler } from './IHandler'

@IHandler.register
export class Create extends BaseHandler {
	private readonly whatId = 'what'
	private readonly whenId = 'when'
	private readonly descriptionId = 'description'
	private readonly partySizeId = 'partysize'

	constructor(client: Client, logger: Logger, config: Config, mongoConnector: MongoConnector) {
		super(client, logger, config, mongoConnector, BotCommand.create)

		this.slash
			.setDescription('Create new event')
			.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	}

	public process(interaction: ChatInputCommandInteraction): void {
		this.startLfgEvent(interaction)
			.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason as string))
	}


	private async startLfgEvent(interaction: ChatInputCommandInteraction) {
		const lfgChannel = await this.mongoConnector.lfgChannelRepository.get(interaction.guildId ?? '', interaction.channelId ?? '')
		if (!lfgChannel) return

		const description = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(this.descriptionId)
				.setLabel('Description')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true))

		const what = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(this.whatId)
				.setLabel('What')
				.setStyle(TextInputStyle.Short))

		const when = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(this.whenId)
				.setLabel('When')
				.setStyle(TextInputStyle.Short))

		const groupSize = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(this.partySizeId)
				.setLabel('Group Size')
				.setStyle(TextInputStyle.Short))

		const modal = new ModalBuilder()
			.setCustomId('lfgSurvey')
			.setTitle('Create event')
			.addComponents(description, what, when, groupSize)

		await interaction.showModal(modal)
	}

	public fillEmbed(embed: EmbedBuilder): void {
		embed.addFields({
			name: `${this.cmd}`,
			value: `Start creating new event for an LFG channel. 
			This command will show you form to submit values for event. Your response will be used to generate event in the channel`
		})
	}
}