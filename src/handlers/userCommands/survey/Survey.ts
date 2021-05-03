import { Message,
	GuildCreateChannelOptions,
	GuildChannel,
	TextChannel,
	User,
	DMChannel
} from 'discord.js'
import { Constants,
	Messages
} from '../../../descriptor'
import { EventOptions,
	SetupStep
} from '../../../entities'
import { BotCommand,
	ChannelType,
	Permission
} from '../../../enums'
import { Logger } from '../../../Logger'
import { SurveyError } from './SurveyError'

export class Survey {
	private logger: Logger

	constructor(logger: Logger) {
		this.logger = logger
	}

	private eventQuestions: SetupStep[] = [
		new SetupStep(Messages.eventNameQuestion, Messages.eventWarning, (response) => { return response?.content !== BotCommand.skip }, true),
		new SetupStep(Messages.whenQuestion, Messages.invalidResponse, (response) => { return response !== undefined }, false),
		new SetupStep(Messages.descibeQuestion, Messages.invalidResponse, (response) => { return response !== undefined }, false)
	]

	public async tryConduct(message: Message, botId: string): Promise<EventOptions | undefined> {
		const channel = await this.createTextChannel(message, botId)
		if(!channel) return undefined
		return this.conduct(channel, message)
			.catch((err) => this.handleConductError(channel, message.author, err))
	}

	public async conduct(channel: TextChannel, message: Message): Promise<EventOptions | undefined> {
		this.sendMessage(channel, Messages.followSurvey(message.author.id))
		this.sendMessage(channel, Messages.explainAbortCommand)

		const options = {} as EventOptions
		const filter: (m: Message) => boolean = m => m.author.id === message.author.id

		// try to get event name twice
		const name = await this.getEventName(channel, this.eventQuestions[0], filter)

		// if failed - delete temp channel and drop event creation
		if(!name) {
			this.sendMessage(channel, Messages.setupFailed)
			this.deleteTempChannel(channel)
			return undefined
		}
		// if aborted by user - delete temp channel and drop event creation
		if(name?.content === BotCommand.abort) {
			this.deleteTempChannel(channel)
			return undefined
		}

		// try to get answers from user to at least one of the optional question
		// will recieve Error if:
		// - no answers recieved after 3 rounds of questions
		// - took to long for user to respond
		// - process was aborted by user
		const answers = await this.tryGetAnswers(channel, [1, 2], message.author.id)

		// adapt from array to more convenient type
		options.name = name
		if (answers[1]) options.when = answers[1]
		if (answers[2]) options.description = answers[2]

		// survey is ended, temp channel no longer needed
		this.deleteTempChannel(channel)

		return options
	}

	private handleConductError(channel: TextChannel, author: User,err: any): undefined {
		if(err instanceof SurveyError) {
			this.deleteTempChannel(channel)
			author.createDM()
				.then(dmChannel => this.explainError(dmChannel, err.message))
				.catch(reason => this.logger.logError(this.constructor.name, this.handleConductError.name, reason))
			return
		}
		throw err
	}

	private async tryGetAnswers(channel: TextChannel, questionIds: number[], authorId: string, index = 0): Promise<(Message | undefined)[]> {
		const answers = await this.tryGetAnswersOnce(channel, questionIds, authorId)
		index++
		// if at least 1 of the optional questions was answered - good to go further
		if(this.anyOptionFilled(channel, answers)) return answers
		// if took too much attempts - abort the process
		if(index > Constants.questionAttemptCount) {
			this.deleteTempChannel(channel)
			throw new SurveyError(Messages.setupFailed)
		}
		// give user another chance
		return this.tryGetAnswers(channel, questionIds, authorId, index)
	}

	private async tryGetAnswersOnce(channel: TextChannel, questionIds: number[], authorId: string): Promise<(Message | undefined)[]> {
		const answers: (Message | undefined)[] = []
		for(const questionId of questionIds) {
			answers.push(await this.tryGetAnswer(channel, questionId, authorId))
		}
		return answers
	}

	private async tryGetAnswer(channel: TextChannel, questionId: number, authorId: string): Promise<Message | undefined> {
		const answer = await this.getDetail(channel, this.eventQuestions[questionId], m => m.author.id === authorId)
		this.checkForAbort(channel, answer)

		// if no error was thrown before - answer is considered valid and good to go further
		return answer
	}

	private async getEventName(channel: TextChannel, step: SetupStep, filter: (m: Message) => boolean): Promise<Message | undefined> {
		return this.getDetail(channel, step, filter)
			.catch(() => { return this.getDetail(channel, step, filter)})
	}

	private async getDetail(channel: TextChannel, step: SetupStep, filter: (m: Message) => boolean): Promise<Message | undefined> {
		await channel.send(step.question)
		return this.tryReadLine(channel, step, filter)
	}

	private async tryReadLine(channel: TextChannel, step: SetupStep, filter: (m: Message) => boolean): Promise<Message | undefined> {
		try {
			const collected = await channel.awaitMessages(filter, { max: Constants.maxAnswersExpected, time: Constants.timeToRespond, errors: [ Constants.time ] })
			const response = collected.first()
			return this.validateResponse(response, channel, step)
		}
		catch (e) {
			this.sendMessage(channel, Messages.noResponse)
			throw new SurveyError(Messages.noResponse)
		}
	}

	private validateResponse(response: Message | undefined, channel: TextChannel,  step: SetupStep) {
		if(response?.content === BotCommand.abort) return response
		if (!step.required || step.validate(response)) {
			return step.skipped(response) ? undefined : response
		}

		this.sendMessage(channel, step.warning)
	}

	private anyOptionFilled(channel: TextChannel, answers: (Message | undefined)[]): boolean {
		if (!answers.some(answer => answer)) {
			this.sendMessage(channel, Messages.fillWhenOrDescription)
			return false
		}
		return true
	}

	private async createTextChannel(message: Message, botId: string): Promise<TextChannel | undefined> {
		const channel = message.channel as GuildChannel
		if (!message.guild || !channel) return undefined

		const options: GuildCreateChannelOptions = {
			permissionOverwrites: [
				{ id: message.guild.id, deny: [Permission.sendMessages] },
				{ id: botId, allow: [Permission.sendMessages] },
				{ id: message.author ? message.author.id : Constants.emptyString, allow: [Permission.sendMessages] }],
			type: ChannelType.text,
			parent: channel.parent?.id
		}

		return message.guild.channels.create(Constants.lfgChannelName, options)
			.then(ch => {
				return ch as TextChannel
			})
	}

	private checkForAbort(channel: TextChannel, message: Message | undefined): void {
		if(message?.content === BotCommand.abort) {
			this.deleteTempChannel(channel)
			throw new SurveyError(Messages.eventAborted)
		}
	}

	private sendMessage(channel: TextChannel, message: string): void {
		channel.send(message)
			.catch(reason => this.logger.logError(this.constructor.name, this.sendMessage.name, reason))
	}

	private deleteTempChannel(channel: TextChannel): void {
		channel.delete()
			.catch(reason => this.logger.logError(this.constructor.name, this.deleteTempChannel.name, reason))
	}

	private explainError(channel: DMChannel, error: string): void {
		channel.send(Messages.explain(error))
			.catch(reason => this.logger.logError(this.constructor.name, this.explainError.name, reason))
	}
}