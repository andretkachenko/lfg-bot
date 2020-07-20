import { Message, MessageEmbed, MessageReaction, MessageCollector, Channel, DMChannel, User, Client } from "discord.js";
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
			let lfgChannelId = await this.mongoConnector.lfgChannelRepository.getId(reaction.message.guild.id)
			if (lfgChannelId !== reaction.message.guild.id) return

			if (!["👍", "👎"].includes(reaction.emoji.name)) {
				reaction.remove()
			}
		}
	}

	public async handleLfgCalls(message: Message) {
		if (message.guild?.id) {
			if (message.content.indexOf(this.config.prefix + BotCommand.Setup) >= 0) {
				this.setupLfgChannel(message)
				message.delete()
				return
			}

			let lfgChannelId = await this.mongoConnector.lfgChannelRepository.getId(message.guild.id)
			if (lfgChannelId !== message.channel.id) return
			if (message.content.indexOf(this.config.prefix + BotCommand.Ignore) >= 0) return
			if (message.content.indexOf(this.config.prefix + BotCommand.Start) >= 0) {
				this.startLfgEvent(message)
			}
			message.delete()
		}
	}

	private async setupLfgChannel(message: Message) {
		if (message.guild?.id) {
			let lfgChannel: LfgChannel = { guildId: message.guild.id, channelId: message.channel.id }
			await this.mongoConnector.lfgChannelRepository.add(lfgChannel)
			message.channel.send("this channel is now set up as lfg channel")
		}
	}

	private async startLfgEvent(message: Message) {
		let channel = message.channel
		let author = message.author
		let botId = this.client.user ? this.client.user.id : ""

		this.eventSetupHandler.setupEvent(message, botId)
			.then((options: EventOptions | undefined) => {
				if (options) {
					let embed = this.createEmbed(author, options)
					channel.send(embed)
						.then(msg => {
							msg.react("👍")
							msg.react("👎")
						})
				}
			})
	}

	private createEmbed(author: User, options: EventOptions): MessageEmbed {
		let embed = new MessageEmbed()
			.setTitle(author.username + " is looking for a group")
			.setColor("#00D166")
			.setAuthor(author.username, author.displayAvatarURL())
			.setThumbnail(this.config.img)
			.addField("**What**", options.game, true)

		if (options.description) embed.setDescription(options.description)
		if (options.when) embed.addField("**When**", options.when, true)

		return embed
	}
}