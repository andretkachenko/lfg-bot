import { SlashCommandBuilder } from '@discordjs/builders'
import { ChatInputCommandInteraction,
	Client,
	EmbedBuilder
} from 'discord.js'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { Logger } from '../../Logger'

export interface IHandler {
	cmd: string
	slash: SlashCommandBuilder
	process(interaction: ChatInputCommandInteraction): void
	fillEmbed(embed: EmbedBuilder): void
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace IHandler {
	type Constructor<T> = {
	  new(client: Client, logger: Logger, config: Config, mongoConnector: MongoConnector): T
	  readonly prototype: T
	}
	const implementations: Constructor<IHandler>[] = []

	export const getImplementations = (): Constructor<IHandler>[] => {
		return implementations
	}

	export const register = (ctor: Constructor<IHandler>): void => {
		implementations.push(ctor)
	}
}