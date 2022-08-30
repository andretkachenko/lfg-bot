export class EventMessages {
	public static header(username: string): string { return `>>> **${username}** is looking for a group!` }
	public static description(descr: string): string { return `\n**Description:** ${descr}` }
	public static what(what: string): string { return `\n**What:** ${what}` }
	public static when(when: string): string { return `\n**When:** ${when}` }
	public static count(count: string): string { return `\n**Group size:** ${count}` }
}