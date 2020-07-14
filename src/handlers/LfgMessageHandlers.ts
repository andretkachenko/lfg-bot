import { Message, MessageEmbed, MessageReaction } from "discord.js";
import { MongoConnector } from "../db/MongoConnector";
import { Config } from "../config";
import { LfgChannel } from "../entities/LfgChannel";
import { BotCommand } from "../enums/BotCommand";

export class LfgMessageHandlers {
	private mongoConnector: MongoConnector
	private config: Config
	private acceptSign: string = ':heavy_plus_sign:'
	private declineSign: string = ':heavy_minus_sign:'

	constructor(mongoConnector: MongoConnector, config: Config) {
		this.mongoConnector = mongoConnector
		this.config = config
	}

	public async validateReaction(reaction: MessageReaction) {
		if(!["👍", "👎"].includes(reaction.emoji.name)) {
			reaction.remove()
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

	private startLfgEvent(message: Message) {
		let command = message.content
		let channel = message.channel
		let author = message.author

		let args = command.substr((this.config.prefix + BotCommand.Start).length).split('|')
		if (args.length < 2) {
			message.channel.send(`Unable to fetch ${args.length === 0 || args[0] === '' ? "description" : "game"}. Make sure the command is valid.`)
			return
		}
		let description = args[0].trim()
		let game = args[1].trim()

		let embed = new MessageEmbed()
			.setTitle(author.username + " is looking for a group")
			.setDescription(description)
			.setColor("#00D166")
			.setAuthor(author.username, author.displayAvatarURL())
			.setThumbnail(this.config.img)
			.addField("**What**", game, true)

		if (args.length > 2) {
			let date = args[2].trim()
			embed.addField("**When**", date, true)
		}

		channel.send(embed)
			.then(msg => {
				msg.react("👍")
				msg.react("👎")
			})
	}
}