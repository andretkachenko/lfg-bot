import { Message, MessageEmbed, MessageReaction, MessageCollector, Channel, DMChannel, User, Client, MessageAttachment } from "discord.js";
import { MongoConnector } from "../db/MongoConnector";
import { Config } from "../config";
import { LfgChannel } from "../entities/LfgChannel";
import { BotCommand } from "../enums/BotCommand";
import { EventOptions } from "../entities/EventOptions";
import { EventSetupHandler } from "./EventSetupHandler";



export class LfgMessageHandlers {
	private client: Client
	private mongoConnector: MongoConnector
	private config: Config
	private eventSetupHandler: EventSetupHandler

	constructor(mongoConnector: MongoConnector, config: Config, client: Client) {
		this.mongoConnector = mongoConnector
		this.config = config
		this.eventSetupHandler = new EventSetupHandler()
		this.client = client
	}

	public async validateReaction(reaction: MessageReaction) {
		if (reaction.message.guild) {
			let lfgChannel = await this.mongoConnector.lfgChannelRepository.getLfgChannel(reaction.message.guild.id, reaction.message.channel.id)
			if (!lfgChannel || !lfgChannel.moderate) return

			if (!["👍", "👎"].includes(reaction.emoji.name)) {
				reaction.remove()
			}
		}
	}

	public async handleLfgCalls(message: Message) {
		if (!message.guild?.id) return
		if (message.content.indexOf(this.config.prefix + BotCommand.Ignore) >= 0 && this.canManageChannels(message)) return

		let lfgChannel = await this.mongoConnector.lfgChannelRepository.getLfgChannel(message.guild.id, message.channel.id)		
		let isLfgCmd = false

		if (message.content.indexOf(this.config.prefix + BotCommand.Setup) >= 0 && !lfgChannel && this.canManageChannels(message)) {
			this.setupLfgChannel(message)
			isLfgCmd = true
		}
		if (message.content.indexOf(this.config.prefix + BotCommand.Moderate) >= 0 && this.canManageChannels(message)) {
			this.updateModerationOption(message)
			isLfgCmd = true
		}
		if (message.content.indexOf(this.config.prefix + BotCommand.Start) >= 0 && lfgChannel) {
			this.startLfgEvent(message)
			isLfgCmd = true
		}
		if(isLfgCmd || (lfgChannel && lfgChannel.moderate)) message.delete()
	}

	private async updateModerationOption(message: Message) {
		if (!message.guild?.id) return
		let moderateCmd = this.config.prefix + BotCommand.Moderate
		let cmd = message.content.substring(moderateCmd.length + 1)
		let args = cmd.split(' ')
		let lfgChannel: LfgChannel = { guildId: message.guild.id, channelId: args[0].substring(2, args[0].length-1), moderate: args[1] == '1' }
		this.mongoConnector.lfgChannelRepository.setModeration(lfgChannel)
	}

	private async setupLfgChannel(message: Message) {
		if (!message.guild?.id) return
		let lfgChannel: LfgChannel = { guildId: message.guild.id, channelId: message.channel.id, moderate: true }
		await this.mongoConnector.lfgChannelRepository.add(lfgChannel)
		message.channel.send("this channel is now set up as lfg channel")
	}

	private async startLfgEvent(message: Message) {
		let channel = message.channel
		let author = message.author
		let botId = this.client.user ? this.client.user.id : ""

		this.eventSetupHandler.setupEvent(message, botId)
			.then((options: EventOptions | undefined) => {
				if (options) {
					let event = this.createEventMessage(author, options)
					let attachments = this.gatherAttachments(options)
					channel.send(event, attachments)
						.then(msg => {
							msg.react("👍")
							msg.react("👎")
						})
				}
			})
	}

	private createEventMessage(author: User, options: EventOptions): string {
		let msg = `>>> **${author.username}** is looking for a group!`
		if (options.description) msg += `\n**Description:** ${options.description}`
		msg += `\n**What:** ${options.game}`
		if (options.when) msg += `\n**When:** ${options.when}`

		return msg
	}

	private gatherAttachments(options: EventOptions): MessageAttachment[] {
		let gameAttachements = options.game ? options.game.attachments.array() : new Array<MessageAttachment>()
		let whenAttachements = options.when ? options.when.attachments.array() : new Array<MessageAttachment>()
		let descriptionAttachements = options.description ? options.description.attachments.array() : new Array<MessageAttachment>()

		return gameAttachements
			.concat(whenAttachements)
			.concat(descriptionAttachements)
	}

    private canManageChannels(message: Message): boolean {
        return message.member !== null && message.member.hasPermission("MANAGE_CHANNELS")
    }
}