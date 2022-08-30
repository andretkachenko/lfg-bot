export class Messages {
	public static readonly processExit = 'Process exit'
	public static readonly startingBot = 'Starting bot...'
	public static readonly botConnected = 'Bot Connected'
	public static readonly loggedAs = 'Logged in as '
	public static readonly unhandledRejection = 'Uncaught Rejection'
	public static readonly discordWarn = 'Discord Client Warning'
	public static readonly pingResponse = 'alive and waiting for your commands'

	public static followSurvey(userId: string): string { return `<@${userId}>, please follow the survey to set up your event.` }
	public static readonly explainAbortCommand = 'Send "abort" if you want to abort event setup process'
	public static readonly eventNameQuestion = 'Give name to your event'
	public static readonly eventWarning = 'Event name should be filled.'
	public static readonly whenQuestion = 'When? (SEND "skip" if you don\'t want to fill the field)'
	public static readonly descibeQuestion = 'How would you describe this event? (send "skip" if you don\'t want to fill the field)'
	public static readonly countQuestion = 'How many people can participate? (send "skip" if you don\'t want to fill the field)'
	public static readonly fillWhenOrDescription = "Either 'when' or 'description' should be filled."

	public static readonly errorProcessingChannelId = 'Error processing channel '
	public static readonly invalidResponse = 'Error processing your response'
	public static readonly noResponse = 'Took to long to respond.'
	public static readonly setupFailed = 'Event was not set up'
	public static readonly channelSetupSuccess = 'this channel is now set up as lfg channel'
	public static readonly eventAborted = 'User aborted event setup process. Exiting...'
	public static explain(err: string): string { return `It seems you faced some issues when tried to create event:\n ${err}` }
	public static statusString(amt: number): string { return `${amt} servers`}
}