import { Message, GuildCreateChannelOptions, GuildChannel, TextChannel } from "discord.js"
import { EventOptions } from "../entities/EventOptions"
import { SetupStep } from "../entities/SetupStep"
import { Permission } from "../enums/Permissions"

export class EventSetupHandler {
	private eventQuestions: SetupStep[] = [
		new SetupStep('What game would you like to play?', 'Game should be filled.', (response) => { return response && response?.content !== "skip" ? true : false }, true),
		new SetupStep('When? (send "skip" if you don\'t want to fill the field)', 'Error processing your response', (response) => { return response ? true : false }, false),
		new SetupStep('How would you describe this event? (send "skip" if you don\'t want to fill the field)', 'Error processing your response', (response) => { return response ? true : false }, false)
	]
	
	public async setupEvent(message: Message, botId: string): Promise<EventOptions | undefined> {
		let channel = await this.createTextChannel(message, botId)
		if(!channel) return undefined
		channel.send(`<@${message.author.id}>, please follow the survey to set up your event.`)
		channel.send('Send "abort" if you want to abort event setup process')

		let options = {} as EventOptions
		let filter: (m: Message) => boolean = m => m.author.id === message.author.id

		let game = await this.getDetail(channel, this.eventQuestions[0], filter)
		.then((game) => {
			return !game ? this.getDetail(channel as TextChannel, this.eventQuestions[0], filter) : game
		})

		if(!game) {
			channel.send('Event was not set up')
			channel.delete()
			return undefined
		}
		if(game?.content === "abort") {
		channel.delete()
		return undefined
		}

		let max = 3
		let index = 0
		let when: Message | undefined, description: Message | undefined
		while (index < max) {
			when = await this.getDetail(channel, this.eventQuestions[1], m => m.author.id === message.author.id)
			if(when?.content === "abort") {
				channel.delete()
				return undefined
			}
			description = await this.getDetail(channel, this.eventQuestions[2], m => m.author.id === message.author.id)
			if(description?.content === "abort") {
				channel.delete()
				return undefined
			}
			if (!when && !description) {
				channel.send("Either 'when' or 'description' should be filled.")
				++index
			}
			else break
		}
		if (!when && !description) {
			channel.send("Event was not set up")
			channel.delete()
			return undefined
		}

		options.game = game
		if (when) options.when = when
		if (description) options.description = description

		channel.delete()

		return options
	}

	private async getDetail(channel: TextChannel, step: SetupStep, filter: (m: Message) => boolean): Promise<Message | undefined> {
		let result: Message | undefined
		return channel.send(step.question)
			.then(async () => {
				try {
					const collected = await channel.awaitMessages(filter, { max: 1, time: 300000, errors: ['time'] });
					let response = collected.first()
					if(response?.content === "abort") return response
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
    
    

	private async createTextChannel(message: Message, botId: string): Promise<TextChannel | undefined> {
		let user = message.author
		let channel = message.channel as GuildChannel
		let guild = message.guild
		if (guild) {
			let options: GuildCreateChannelOptions = {
				permissionOverwrites: [
					{ id: guild.id, deny: [Permission.SEND_MESSAGES] }, 
					{id: botId, allow: [Permission.SEND_MESSAGES] },
					{ id: user ? user.id : "", allow: [Permission.SEND_MESSAGES] }],
                type: "text",
                parent: channel.parent?.id
			}
			if (channel) {
				return guild.channels.create('lfg-setup', options)
					.then(ch => {
						return ch as TextChannel;
					});
			}
		}

		return undefined
	}
}