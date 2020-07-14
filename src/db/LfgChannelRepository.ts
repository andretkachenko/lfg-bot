import { MongoClient, DeleteWriteOpResultObject } from "mongodb";
import { Config } from "../config";
import { LfgChannel } from "../entities/LfgChannel";

export class LfgChannelRepository {
    private client: MongoClient
    private lfgChannelCollectionName: string
    private dbName: string

    constructor(client: MongoClient, config: Config) {
        this.client = client;
        this.dbName = config.mongoDb
        this.lfgChannelCollectionName = config.lfgChannelCollectionName
    }

    public async getId(guildId: string): Promise<string> {
        let channelId: string = ''
        let db = this.client.db(this.dbName);
        let lfgChannels = db.collection<LfgChannel>(this.lfgChannelCollectionName);
        let aggregation = lfgChannels.find({ guildId: guildId })
        return aggregation.toArray()
            .then(channels => {
                let lfgChannel = channels[0];
                if (lfgChannel !== undefined) channelId = lfgChannel.channelId
                return channelId
            })
    }

    public async add(lfgChannel: LfgChannel): Promise<boolean> {
        let result = false
        let db = this.client.db(this.dbName)
        let lfgChannels = db.collection(this.lfgChannelCollectionName)
        return lfgChannels.insertOne(lfgChannel)
        .then((insertResult) => {
            if (insertResult.result.ok !== 1) console.log("command not executed correctly: document not inserted")
            else {
                console.log("document inserted")
                result = true
            }
            return result
        })
    }

    public async delete(guildId: string, voiceChannelId: string): Promise<boolean> {
        let result = false
        let db = this.client.db(this.dbName)
        let textChannels = db.collection(this.lfgChannelCollectionName)
        return textChannels.deleteOne({ guildId: guildId, voiceChannelId: voiceChannelId })
            .then((deleteResult) => {
                if (deleteResult.result.ok !== 1) console.log("command not executed correctly: document not deleted")
                else {
                    console.log("document deleted")
                    result = true
                }
                return result
            })
    }
}