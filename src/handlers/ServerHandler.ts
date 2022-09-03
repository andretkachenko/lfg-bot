import {
	Guild,
	Message,
	ModalSubmitInteraction,
	User
} from 'discord.js'
import { MongoConnector } from '../db/MongoConnector'
import { Constants,
	EventMessages
} from '../descriptor'
import { ModalIds } from '../enums'
import { Logger } from '../Logger'

export class ServerHandler {
	private logger: Logger
	private mongoConnector: MongoConnector

	constructor(logger: Logger, mongoConnector: MongoConnector) {
		this.logger = logger
		this.mongoConnector = mongoConnector
	}

	public handleBotKickedFromServer(guild: Guild): void {
		this.mongoConnector.repositories.forEach(repo => {
			repo.deleteForGuild(guild.id)
				.catch(reason => this.logger.logError(this.constructor.name, this.handleBotKickedFromServer.name, reason as string, repo.constructor.name))
		})
	}

	public async print(interaction: ModalSubmitInteraction): Promise<void> {
		if(!interaction) return

		const description = interaction.fields.getTextInputValue(ModalIds.descriptionId)
		const what = interaction.fields.getTextInputValue(ModalIds.whatId)
		const when = interaction.fields.getTextInputValue(ModalIds.whenId)
		const size = interaction.fields.getTextInputValue(ModalIds.partySizeId)

		const msg = this.createEventMessage(interaction.user, what, description, when, size)

		interaction.channel?.send(msg)
			.then(message => this.addAllowedEmotes(message))
			.catch(reason => this.logger.logError(this.constructor.name, this.print.name, reason as string))

		await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true })
			.catch(reason => this.logger.logError(this.constructor.name, this.print.name, reason as string))
	}
	private createEventMessage(author: User, what: string, description: string, when: string, size: string): string {
		let msg = EventMessages.header(author.username)
		if (description) msg += EventMessages.description(description)
		msg += EventMessages.what(what)
		if (when) msg += EventMessages.when(when)
		if (size) msg += EventMessages.count(size)

		return msg
	}

	private addAllowedEmotes(msg: Message) {
		msg.react(Constants.acceptEmote)
			.catch(reason => this.logger.logError(this.constructor.name, this.addAllowedEmotes.name, reason as string))
		msg.react(Constants.declineEmote)
			.catch(reason => this.logger.logError(this.constructor.name, this.addAllowedEmotes.name, reason as string))
	}
}