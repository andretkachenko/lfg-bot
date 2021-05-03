import { Message } from 'discord.js'

export class EventMessages {
	public static header(username: string): string { return `>>> **${username}** is looking for a group!` }
	public static description(descr: Message): string { return `\n**Description:** ${descr.content}` }
	public static what(what: Message): string { return `\n**What:** ${what.content}` }
	public static when(when: Message): string { return `\n**When:** ${when.content}` }
}