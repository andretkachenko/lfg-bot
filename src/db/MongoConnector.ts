import { Config } from '../config'
import { MongoClient } from 'mongodb'
import { LfgChannelRepository } from './LfgChannelRepository';

export class MongoConnector {
    private client: MongoClient
    public lfgChannelRepository: LfgChannelRepository

    constructor(config: Config) {
        let uri = `mongodb+srv://${config.mongoName}:${config.mongoPassword}@${config.mongoCluster}`
        this.client = new MongoClient(uri, { useNewUrlParser: true });

        this.client.connect((err) => {
            if (err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
                return;
            }
        })

        this.lfgChannelRepository = new LfgChannelRepository(this.client, config)
    }
}