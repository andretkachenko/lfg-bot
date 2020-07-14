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
            .setTitle("LFG")
            .setDescription("Discord Bot to set up #looking-for-group channel.")
            .setColor("#0099ff")
            .setAuthor('LFG', this.config.img, 'https://github.com/AndreTkachenkoOrg/lfg-bot')
            .setThumbnail(this.config.img)
            .addField("**Want to use it on your server?**", "Follow this link: https://github.com/AndreTkachenkoOrg/lfg-bot#want-to-use-at-your-server")
            .addField("**Any issues or missing feature?**", "You can suggest it via https://github.com/AndreTkachenkoOrg/lfg-bot/issues")
            .setFooter(`LFG`);
        message.channel.send(embed)
    }
}