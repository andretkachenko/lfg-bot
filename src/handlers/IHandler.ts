import { SlashCommandBuilder } from '@discordjs/builders'
import { ChatInputCommandInteraction } from 'discord.js'

export interface IHandler {
	cmd: string
	slash: SlashCommandBuilder
	process(interaction: ChatInputCommandInteraction): void
}