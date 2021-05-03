export enum BotCommand {
	help = 'help',
	ping = 'ping',
	start = 'start',
	setup = 'setup',
	ignore = 'ignore',
	moderate = 'moderate',

	// these are flow-operating commands during start event process
	skip = 'skip',
	abort = 'abort'
}