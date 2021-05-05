import { Config } from '../Config'
import { MongoClient } from 'mongodb'
import { Repository } from './Repository'
import { IGuildRelated } from '../entities'
import { LfgChannelsRepository } from '.'
import { Logger } from '../Logger'

export class MongoConnector {
	private client: MongoClient

	public repositories: Repository<IGuildRelated>[]
	public lfgChannelRepository: LfgChannelsRepository

	constructor(config: Config, logger: Logger) {
		const uri = `mongodb+srv://${config.mongoName}:${config.mongoPassword}@${config.mongoCluster}`
		this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

		this.client.connect((err) => {
			if (err) {
				logger.logError(this.constructor.name, this.constructor.name, err.message)
				return
			}
		})

		this.lfgChannelRepository = new LfgChannelsRepository(logger, this.client, config.mongoDb)

		// add repository to this arrray for auto clearance at GuildDelete event
		this.repositories = [
			this.lfgChannelRepository,
		]
	}
}