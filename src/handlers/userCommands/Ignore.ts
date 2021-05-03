import {
	Message,
	MessageEmbed
} from 'discord.js'
import {
	BotCommand
} from '../../enums'
import { BaseHandler } from './BaseHandler'
import { Logger } from '../../Logger'
import { Config } from '../../config'
import { MongoConnector } from '../../db'

export class Ignore extends BaseHandler {

	constructor(logger: Logger, mongoConnector: MongoConnector, config: Config) {
		super(logger, mongoConnector, config, BotCommand.ignore)
	}

	protected process(_message: Message): void {
		// this function is to one-time moderation override
		// empty process is required to omit chain command
		return
	}

	protected deleteCommandMessage(_message: Message): void {
		// message should not be deleted if it was sent with ignore command
		return
	}

	public fillEmbed(embed: MessageEmbed): void {
		embed
			.addField(`${this.cmd} <message>`, `
		add message to the lfg channel. Other messages (ignoring commands) will be deleted immediately from lfg channel. 
		
		Example: 
		"${this.cmd} This message is introductory thus should not be deleted".
		This message will be ignored by the bot and will not be deleted. You can then edit it to remove "${this.cmd}' part.

        Requires user to have admin/owner rights or permissions to manage channels.
        `)
	}
}