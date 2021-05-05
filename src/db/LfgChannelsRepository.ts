import { MongoClient } from 'mongodb'
import { LfgChannel } from '../entities/LfgChannel'
import { Logger } from '../Logger'
import { Repository } from './Repository'

export class LfgChannelsRepository extends Repository<LfgChannel> {
	constructor(logger: Logger, client: MongoClient, dbName: string) {
		super(logger, client, dbName)
	}

	public async get(guildId: string, channelId: string): Promise<LfgChannel> {
		return super.getFirst({ guildId, channelId })
	}

	public async setModeration(lfgChannel: LfgChannel, moderate: boolean | undefined): Promise<boolean> {
		return super.update({
			guildId: lfgChannel.guildId,
			channelId: lfgChannel.channelId
		}, {
			$set: {
				moderate
			}
		})
	}
}