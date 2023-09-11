import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { Config } from '../Config'
import { Logger } from '../Logger'
import { BotCommand, Ping, IHandler } from '.'

export class Help implements IHandler {
	public readonly cmd: string
	public slash: SlashCommandBuilder
	private logger: Logger
	private readonly img: string

	constructor(logger: Logger, config: Config) {
		this.cmd = BotCommand.help
		this.logger = logger
		this.img = config.img

		this.slash = new SlashCommandBuilder()
			.setName(this.cmd)
			.setDescription('How to use')
			.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	}

	public process(interaction: ChatInputCommandInteraction): void {
		try {
			this.trySendHelp(interaction)
		}
		catch (e) {
			this.logger.logError(this.constructor.name, this.process.name, e as string)
		}
	}

	private trySendHelp(interaction: ChatInputCommandInteraction): void {
		const embed = this.createEmbed()
		interaction.reply({ embeds: [embed], ephemeral: true })
			.catch(reason => {
				this.logger.logError(this.constructor.name, this.trySendHelp.name, reason as string)
			})
	}

	public createEmbed(): EmbedBuilder {
		const repoUrl = 'https://github.com/andretkachenko/lfg-bot'

		return new EmbedBuilder()
			.setColor('#0099ff')
			.setAuthor({
				name: 'LFG Bot - event manager',
				iconURL: this.img,
				url :repoUrl
			})
			.addFields([{
				name: `\`/${BotCommand.create}\``,
				value: `Start creating new event for an LFG channel. 
						This command will show you form to submit values for event. Your response will be used to generate event in the channel`
			}, {
				name: `\`/${BotCommand.ping}\``,
				value: `This command is created to check if the bot is alive. Writes \`'${Ping.pingResponse}'\` in the chat if the bot is working.`
			}, {
				name: 'Any issues or missing feature?',
				value: `You can raise a ticket at ${repoUrl}/issues`
			}])
	}
}