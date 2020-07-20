import { Message, MessageEmbed } from "discord.js";
import { Config } from "../config";
import { BotCommand } from "../enums/BotCommand";

export class InfoHandlers {
    private config: Config

    constructor(config: Config) {
        this.config = config
    }

    public handleHelpCall(message: Message) {
        if (message.content === this.config.prefix + BotCommand.Help) {
            this.giveHelp(message)
            return
        }
    }
    private giveHelp(message: Message) {
        let embed = new MessageEmbed()
        .setTitle("**LFG**")
        .setDescription("Discord Bot to set up #looking-for-group channel.")
        .setColor("#0099ff")
        .setAuthor('LFG', this.config.img, 'https://github.com/AndreTkachenkoOrg/lfg-bot')
        .setThumbnail(this.config.img)
        .addField("**List of available commands**", `
        **${this.config.prefix}setup** - make this channel an lfg channel. Bot will only react to messages in the lfg channel
        **${this.config.prefix}ignore [message]** - add message to the lfg channel. Other messages (ignoring commands) will be deleted immediately from lfg channel. Example: "lfg ignore This message is introductory thus should not be deleted"
        **${this.config.prefix}start** - add lfg message to the lfg channel. New temp channel will be created, where the user will be prompted to complete survey. User's answers will be collected into an embed and sent to the lfg channel.
        `)
        .addField("**Want to use it on your server?**", "Follow this link: https://github.com/AndreTkachenkoOrg/lfg-bot#want-to-use-at-your-server")
        .addField("**Any issues or missing feature?**", "You can suggest it via https://github.com/AndreTkachenkoOrg/lfg-bot/issues")
        message.channel.send(embed)
    }
}