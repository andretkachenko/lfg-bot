import { DMChannel, Message,
	MessageEmbed,
	NewsChannel,
	TextChannel
} from 'discord.js'
import { IHandler } from '.'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { Constants } from '../../descriptor'
import { BotCommand,
	ChannelType
} from '../../enums'
import { Logger } from '../../Logger'
import { TypeGuarder } from '../../services'
import { UserCommandHandlers } from '../UserCommandHandlers'
import { BaseHandler } from './BaseHandler'

export class Help extends BaseHandler {
	private cmdChain: UserCommandHandlers

	constructor(logger: Logger, mongoConnector: MongoConnector, config: Config, cmdChain: UserCommandHandlers) {
		super(logger, mongoConnector, config, BotCommand.help)
		this.cmdChain = cmdChain
	}

	protected process(message: Message): void {
		let docType: string = BotCommand.help
		try
		{
			docType = this.findDocHandler(message, docType)
		}
		catch (e) {
			this.logger.logError(this.constructor.name, this.process.name, e, docType)
			this.trySendHelp(message.channel, this)
		}
	}

	private findDocHandler(message: Message, docType: string) {
		const args = this.splitArguments(this.trimCommand(message))
		if (args[0])
			docType = args[0]
		const docHandler = this.cmdChain.getDocHandler(docType) ?? this
		this.trySendHelp(message.channel, docHandler)
		return docType
	}

	private trySendHelp(channel: TextChannel | DMChannel | NewsChannel, handler: IHandler): void {
		const embed = this.createEmbed()
		handler.fillEmbed(embed)
		this.addFooter(embed)
		channel.send(embed)
			.catch(reason => {
				const guildId = TypeGuarder.isGuildChannel(channel) ? channel.guild.id : ChannelType.dm
				this.logger.logError(this.constructor.name, this.trySendHelp.name, reason, guildId)
			})
	}

	protected hasPermissions(_message: Message): boolean {
		return true
	}

	public fillEmbed(embed: MessageEmbed): void {
		embed
			.addField('List of available commands',`			
			\`#{channel}\` - 'mention text channel', \`[0/1]\` - choose one option, \`<message>\` - placeholder for your message
			\`${this.prefix+BotCommand.setup}\` - make this channel an lfg channel. Bot will only create event in lfg channels.
			\`${this.prefix+BotCommand.ignore} <message>\` - add message to the lfg channel. Other messages (ignoring commands) will be deleted immediately from lfg channel.
			\`${this.prefix+BotCommand.moderate} [0/1] #{channel}\` - enable/disable deletion of messages and reactions.
			\`${this.prefix+BotCommand.start}\` - start survey to create event in an lfg channel. Work only in lfg channels.

			To get detailed explanation of any command, write help with the name of a command. For example: \`${this.cmd + ' ' + BotCommand.start}\`
			`)
	}

	private createEmbed(): MessageEmbed {
		return new MessageEmbed()
			.setColor(Constants.embedInfoColor)
			.setAuthor(Constants.embedTitle, this.img, Constants.repoUrl)
	}

	private addFooter(embed: MessageEmbed): void {
		embed
			.addField('Want to use it on your server?', 'Follow this link: ' + Constants.repoUrl+Constants.inviteGuideUri)
			.addField('Any issues or missing feature?', 'You can raise a ticket at ' + Constants.repoUrl+Constants.issuesUri)
	}
}