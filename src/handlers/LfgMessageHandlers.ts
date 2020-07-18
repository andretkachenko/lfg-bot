import { Message, MessageEmbed, MessageReaction, MessageCollector, Channel, DMChannel, User } from "discord.js";
import { MongoConnector } from "../db/MongoConnector";
import { Config } from "../config";
import { LfgChannel } from "../entities/LfgChannel";
import { BotCommand } from "../enums/BotCommand";
import { EventOptions } from "../entities/EventOptions";
import { SetupStep } from "../entities/SetupStep";



export class LfgMessageHandlers {
	private mongoConnector: MongoConnector
	private config: Config
	private eventQuestions: SetupStep[] = [
		new SetupStep('What game would you like to play?', 'Game should be filled.', (response) => { return response && response !== "skip" ? true : false }, true),
		new SetupStep('When? (send "skip" if you don\'t want to fill the field)', 'Error processing your response', (response) => { return response ? true : false }, false),
		new SetupStep('How would you describe this event? (send "skip" if you don\'t want to fill the field)', 'Error processing your response', (response) => { return response ? true : false }, false)
	]

	constructor(mongoConnector: MongoConnector, config: Config) {
		this.mongoConnector = mongoConnector
		this.config = config
	}

	public async validateReaction(reaction: MessageReaction) {
		if (!["👍", "👎"].includes(reaction.emoji.name)) {
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

	private async startLfgEvent(message: Message) {
		let channel = message.channel
		let author = message.author

		this.setupEvent(message)
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

	private async setupEvent(message: Message): Promise<EventOptions | undefined> {
		let dmChannel = await message.author.createDM()
		dmChannel.send('Send "abort" if you want to abort event setup process')

		let options = {} as EventOptions

		let game = await this.getDetail(dmChannel, this.eventQuestions[0])
		.then((game) => {
			return !game ? this.getDetail(dmChannel, this.eventQuestions[0]) : game
		})

		if(!game) {
			dmChannel.send('Event was not set up')
			return undefined
		}
		if(game === "abort") return undefined

		let max = 3
		let index = 0
		let when: string | undefined, description: string | undefined
		while (index < max) {
			when = await this.getDetail(dmChannel, this.eventQuestions[1])
			if(when === "abort") return undefined
			description = await this.getDetail(dmChannel, this.eventQuestions[2])
			if(description === "abort") return undefined
			if (!when && !description) {
				dmChannel.send("Either 'when' or 'description' should be filled.")
				++index
			}
			else break
		}
		if (!when && !description) {
			dmChannel.send("Event was not set up")
			return undefined
		}

		options.game = game
		if (when) options.when = when
		if (description) options.description = description

		return options
	}

	private async getDetail(channel: DMChannel, step: SetupStep): Promise<string | undefined> {
		let result: string | undefined
		return channel.send(step.question)
			.then(async () => {
				try {
					const collected = await channel.awaitMessages(() => { return true; }, { max: 1, time: 30000, errors: ['time'] });
					let response = collected.first()?.content;
					if(response === "abort") return response
					if (!step.required || step.validate(response)) {
						result =  step.skipped(response) ? undefined : response;
					}
					else {
						channel.send(step.warning);
					}

					return result;
				}
				catch (e) {
					channel.send('Took to long to respond.');
					return result;
				}
			});
	}
}