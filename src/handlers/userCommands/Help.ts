import {
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits
} from 'discord.js'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { BotCommand, ChannelType } from '../../enums'
import { Logger } from '../../Logger'
import { TypeGuarder } from '../../services'
import { BaseHandler } from './BaseHandler'
import { IHandler } from './IHandler'

@IHandler.register
export class Help extends BaseHandler {
	private config: Config
	private readonly cmdOption = 'command'

	constructor(client: Client, logger: Logger, config: Config, mongoConnector: MongoConnector) {
		super(client, logger, config, mongoConnector, BotCommand.help)

		this.config = config

		this.slash
			.setDescription('How to use')
			.addStringOption(o => o.setName(this.cmdOption).setDescription('command name'))
			.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
	}

	public process(interaction: ChatInputCommandInteraction): void {
		const docType = interaction.options.getString(this.cmdOption) ?? BotCommand.help
		try {
			this.getRequestedDoc(interaction, docType)
		}
		catch (e) {
			this.logger.logError(this.constructor.name, this.process.name, e as string, docType)
			this.trySendHelp(interaction, this)
		}
	}

	private getRequestedDoc(interaction: ChatInputCommandInteraction, docType: string): void {
		const cmds: Map<string, IHandler> = new Map()
		const handlers = IHandler.getImplementations()
		for (const handler of handlers) {
			const instance = new handler(this.client, this.logger, this.config, this.mongoConnector)
			cmds.set(instance.cmd, instance)
		}

		const docHandler = cmds.get(docType)
		if (docHandler) this.trySendHelp(interaction, docHandler)
	}

	private trySendHelp(interaction: ChatInputCommandInteraction, handler: IHandler): void {
		const embed = this.createEmbed()
		handler.fillEmbed(embed)
		this.addFooter(embed)
		interaction.reply({ embeds: [embed], ephemeral: true })
			.catch(reason => {
				const guildId = TypeGuarder.isGuildTextChannel(interaction.channel) ? interaction.channel.guild.id : ChannelType.dm
				this.logger.logError(this.constructor.name, this.trySendHelp.name, reason as string, guildId)
			})
	}

	public fillEmbed(embed: EmbedBuilder): void {
		embed
			.addFields({
				name: 'List of available commands',
				value: `\`#{channel}\` - 'mention text channel', \`[0/1]\` - choose one option, \`<message>\` - placeholder for your message
						\`/${BotCommand.setup}\` - make this channel an lfg channel. Bot will only create event in lfg channels.
						\`/${BotCommand.ignore} <message>\` - add message to the lfg channel. Other messages (ignoring commands) will be deleted immediately from lfg channel.
						\`/${BotCommand.moderate} [True/False] #{channel}\` - enable/disable deletion of messages and reactions.
						\`/${BotCommand.create}\` - start survey to create event in an lfg channel. Work only in lfg channels.

						To get detailed explanation of any command, write help with the name of a command. For example: \`/${this.cmd + ' ' + BotCommand.create}\``
			})
	}
}