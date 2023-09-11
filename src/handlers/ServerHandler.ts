import { Message, ModalSubmitInteraction } from 'discord.js'
import { Logger } from '../Logger'
import { ModalId } from '.'

export class ServerHandler {
	private logger: Logger
	private readonly accept = '👍'
	private readonly decline = '👎'

	constructor(logger: Logger) {
		this.logger = logger
	}

	public async print(interaction: ModalSubmitInteraction): Promise<void> {
		if(!interaction) return

		// gather user input
		const description = interaction.fields.getTextInputValue(ModalId.description)
		const what = interaction.fields.getTextInputValue(ModalId.what)
		const when = interaction.fields.getTextInputValue(ModalId.when)
		const size = interaction.fields.getTextInputValue(ModalId.partySize)

		// combine into one form
		let msg = `>>> **${interaction.user.username}** is looking for a group!`
		if (description) msg += `\n**Description:** ${description}`
		msg += `\n**What:** ${what}`
		if (when) msg += `\n**When:** ${when}`
		if (size) msg += `\n**Group size:** ${size}`

		// send form and inform user about the result
		interaction.channel?.send(msg)
			.then(message => this.addAllowedEmotes(message))
			.catch(reason => this.logger.logError(this.constructor.name, this.print.name, reason as string))

		await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true })
			.catch(reason => this.logger.logError(this.constructor.name, this.print.name, reason as string))
	}

	private addAllowedEmotes(msg: Message) {
		msg.react(this.accept)
			.catch(reason => this.logger.logError(this.constructor.name, this.addAllowedEmotes.name, reason as string))
		msg.react(this.decline)
			.catch(reason => this.logger.logError(this.constructor.name, this.addAllowedEmotes.name, reason as string))
	}
}