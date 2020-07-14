import { Client, Message, PartialMessage, MessageReaction } from "discord.js"
import { Logger } from "./handlers/Logger"
import { LfgMessageHandlers } from "./handlers/LfgMessageHandlers"
import { ClientEvent } from "./enums/ClientEvent"
import { ProcessEvent } from "./enums/ProcessEvent"
import { Config } from "./config"
import { InfoHandlers } from "./handlers/InfoHandlers"
import { MongoConnector } from "./db/MongoConnector"

export class EventRegistry {
    private client: Client
    private config: Config

    private logger: Logger
    private lfgHandlers: LfgMessageHandlers
    private infoHandlers: InfoHandlers

    constructor(client: Client, config: Config) {
        this.client = client
        this.config = config

        let mongoConnector = new MongoConnector(config)

        this.logger = new Logger()
        this.lfgHandlers = new LfgMessageHandlers(mongoConnector, config)
        this.infoHandlers = new InfoHandlers(config)
    }

    public registerEvents() {
        // => Log bot started and listening
        this.registerReadyHandler()

        // => Main worker handlers
        this.registerMessageHandler()
        this.registerReactionHandler()

        // => Bot error and warn handlers
        this.client.on(ClientEvent.Error, this.logger.logError)
        this.client.on(ClientEvent.Warn, this.logger.logWarn)

        // => Process handlers
        this.registerProcessHandlers()
    }

    // ---------------- //
    //  Event Handlers  //
    // ---------------- //

    private registerReadyHandler() {
        !
            this.client.once(ClientEvent.Ready, () => {
                this.logger.introduce(this.client, this.config);
            });
    }

    private registerMessageHandler() {
        this.client.on(ClientEvent.Message, (message: Message) => {
            if(!message.author.bot) {
                this.configCommandHandlers(message)
                this.lfgHandlers.handleLfgCalls(message)
            }
        })
    }

    private registerReactionHandler() {
        this.client.on(ClientEvent.MessageReactionAdd, (reaction: MessageReaction) => {
            this.lfgHandlers.validateReaction(reaction)
        })
    }

    private registerProcessHandlers() {
        process.on(ProcessEvent.Exit, () => {
            const msg = `[nexus-bot] Process exit.`
            this.logger.logEvent(msg)
            console.log(msg)
            this.client.destroy()
        })

        process.on(ProcessEvent.UncaughtException, (err: Error) => {
            const errorMsg = (err ? err.stack || err : '').toString().replace(new RegExp(`${__dirname}\/`, 'g'), './')
            this.logger.logError(errorMsg)
            console.log(errorMsg)
        })

        process.on(ProcessEvent.UnhandledRejection, (reason: {} | null | undefined) => {
            const msg = `Uncaught Promise rejection: ${reason}`
            this.logger.logError(msg)
            console.log(msg)
        })
    }

    private configCommandHandlers(message: Message) {
        this.infoHandlers.handleHelpCall(message)
    }
}