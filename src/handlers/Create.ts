import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders'
import { PermissionFlagsBits, TextInputStyle } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { BotCommand, ModalId, IHandler } from '.'

export class Create implements IHandler {
	public slash: SlashCommandBuilder
	public readonly cmd: string

	constructor() {
		this.cmd = BotCommand.create
		this.slash = new SlashCommandBuilder()
			.setName(this.cmd )
			.setDescription('Create new event')
			.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	}

	public async process(interaction: ChatInputCommandInteraction): Promise<void> {
		const description = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(ModalId.description)
				.setLabel('Description')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true))

		const what = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(ModalId.what)
				.setLabel('What')
				.setStyle(TextInputStyle.Short)
				.setRequired(true))

		const when = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(ModalId.when)
				.setLabel('When')
				.setStyle(TextInputStyle.Short)
				.setRequired(false))

		const groupSize = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(ModalId.partySize)
				.setLabel('Group Size')
				.setStyle(TextInputStyle.Short)
				.setRequired(false))

		const modal = new ModalBuilder()
			.setCustomId('lfgSurvey')
			.setTitle('Create event')
			.addComponents(description, what, when, groupSize)

		await interaction.showModal(modal)
	}
}