import {
	Message,
	MessageReaction,
	PartialMessage,
	PartialMessageReaction,
	PermissionFlagsBits
} from 'discord.js'
import { Constants } from '../descriptor'
import { MongoConnector } from '../db'
import { Logger } from '../Logger'

export class LfgChannelModerator {
	private logger: Logger
	private mongoConnector: MongoConnector

	constructor(logger: Logger, mongoConnector: MongoConnector) {
		this.logger = logger
		this.mongoConnector = mongoConnector
	}

	public async validateMessage(message: Message): Promise<void> {
		if(!message.guild  || !await this.canManageMessages(message)) return

		const lfgChannel = await this.mongoConnector.lfgChannelRepository.get(message.guild.id, message.channel.id)
		if (!lfgChannel || !lfgChannel.moderate || message.author.bot) return

		message.delete()
			.catch(reason => this.logger.logError(this.constructor.name, this.validateMessage.name, reason as string))
	}

	public async validateReaction(reaction: MessageReaction | PartialMessageReaction): Promise<void> {
		if (!reaction.message.guild || !await this.canManageMessages(reaction.message)) return

		const lfgChannel = await this.mongoConnector.lfgChannelRepository.get(reaction.message.guild.id, reaction.message.channel.id)
		if (!lfgChannel || !lfgChannel.moderate || this.allowedEmote({ reaction })) return

		reaction.remove()
			.catch(reason => this.logger.logError(this.constructor.name, this.validateReaction.name, reason as string))
	}

	private async canManageMessages(message: Message<boolean> | PartialMessage): Promise<boolean> {
		if(!message || !message.guild) return false

		const me = await message.guild.members.fetchMe()
		return me.permissions.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages], true)
	}

	private allowedEmote({ reaction }: { reaction: MessageReaction | PartialMessageReaction }): boolean {
		return [Constants.acceptEmote, Constants.declineEmote].includes(reaction.emoji.name ?? '')
	}
}