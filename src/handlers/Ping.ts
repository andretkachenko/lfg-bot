import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { BotCommand, IHandler } from '.'
import { Logger } from '../Logger'

export class Ping implements IHandler {
	public readonly cmd: string
	public static readonly pingResponse = 'alive and waiting for your commands'
	public slash: SlashCommandBuilder
	private logger: Logger

	constructor(logger: Logger) {
		this.cmd = BotCommand.ping
		this.logger = logger

		this.slash = new SlashCommandBuilder()
			.setName(this.cmd)
			.setDescription('Check if the bot is alive')
			.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	}

	public process(interaction: CommandInteraction): void {
		interaction.reply({ content: Ping.pingResponse, ephemeral: true })
			.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason as string))
	}
}