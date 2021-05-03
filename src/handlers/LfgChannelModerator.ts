import { MessageReaction} from 'discord.js'
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

	public async validateReaction(reaction: MessageReaction): Promise<void> {
		if (!reaction.message.guild) return

		const lfgChannel = await this.mongoConnector.lfgChannelRepository.get(reaction.message.guild.id, reaction.message.channel.id)
		if (!lfgChannel || !lfgChannel.moderate || this.allowedEmote(reaction)) return

		reaction.remove()
			.catch(reason => this.logger.logError(this.constructor.name, this.validateReaction.name, reason))
	}

	private allowedEmote(reaction: MessageReaction): boolean {
		return [Constants.acceptEmote, Constants.declineEmote].includes(reaction.emoji.name)
	}
}