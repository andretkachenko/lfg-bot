import {
	APIInteractionDataResolvedChannel,
	GuildBasedChannel,
	GuildChannel,
	GuildTextBasedChannel,
	TextBasedChannel,
} from 'discord.js'


export class TypeGuarder {

	public static isGuildTextChannel(channel: TextBasedChannel | null): channel is GuildTextBasedChannel {
		return (channel as GuildTextBasedChannel).guildId !== null
	}

	public static isGuildChannel(channel:  APIInteractionDataResolvedChannel | GuildBasedChannel | null): channel is GuildBasedChannel {
		return (channel as GuildChannel).guild !== undefined
	}

}