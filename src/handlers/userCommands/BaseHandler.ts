import { SlashCommandBuilder } from '@discordjs/builders'
import { ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
	PermissionFlagsBits
} from 'discord.js'
import { Config } from '../../Config'
import { MongoConnector } from '../../db'
import { Logger } from '../../Logger'
import { IHandler } from './.'
import { Constants } from '../../descriptor'

export abstract class BaseHandler implements IHandler {
	public slash: SlashCommandBuilder
	protected client: Client
	protected logger: Logger
	protected mongoConnector: MongoConnector
	public readonly cmd: string
	protected readonly img: string

	constructor(client: Client, logger: Logger, config: Config, mongoConnector: MongoConnector, cmd : string) {
		this.client = client
		this.logger = logger
		this.mongoConnector = mongoConnector
		this.cmd = cmd
		this.img = config.img

		this.slash = new SlashCommandBuilder()
			.setName(cmd)
			.setDescription(cmd)
	}

	public process(interaction: ChatInputCommandInteraction): void {
		if(!this.hasPermissions(interaction) || interaction.replied) return
		interaction.reply({ content: 'done', ephemeral: true })
			.catch(reason => this.logger.logError(this.constructor.name, this.process.name, reason as string))
	}

	public abstract fillEmbed(embed: EmbedBuilder): void

	protected hasPermissions(interaction: ChatInputCommandInteraction): boolean {
		return interaction.memberPermissions !== null && interaction.memberPermissions.has([PermissionFlagsBits.ManageRoles, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel], true)
	}

	protected createEmbed(): EmbedBuilder {
		return new EmbedBuilder()
			.setColor(Constants.embedInfoColor)
			.setAuthor({
				name: Constants.embedTitle,
				iconURL: this.img,
				url :Constants.repoUrl
			})
	}

	protected addFooter(embed: EmbedBuilder): void {
		embed
			.addFields({
				name: 'Any issues or missing feature?',
				value: 'You can raise a ticket at ' + Constants.repoUrl+Constants.issuesUri
			})
	}

	protected trimMentionMarkers(id: string): string {
		return id.substring(2, id.length-1)
	}
}