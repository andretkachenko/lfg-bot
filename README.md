# LFG
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)  
Discord  Bot for event managing and looking for a group.  
This simple bot will let you set up a separate lfg channel and then send event messages to show that you are looking for a group. Or just post these forms in a general - the bot is easily configurable via standard Discord permission rules (see [hints](#hints) below as an example).
To accept or decline the event, a user can click on 👍 or 👎 emoji, respectively.  
**Want to use it on your server?** You can [self-host](https://github.com/andretkachenko/lfg-bot/wiki) it.  

### Hints
Previously, this bot required setting up a specific lfg channel and restricted users from placing new emojis in it.
Now that all bots have migrated to the slash commands, these things aren't necessary, as they can be configured natively via channel and role permissions.
For example:
1. To enforce using only ```/create``` forms in the channel, you need to remove 'Send Messages' permission for everyone except the bot.
2. To enforce using only standard 👍 or 👎 emojis, you need to remove 'Add Reactions' permission for everyone except the bot (members can still react using existing reactions)
3. To restrict the use of this bot in a specific channel, you need to remove the 'View Channel' permission for the bot.

## Existing commands
**NB:** due to changes in Discord's policies, all commands were changed to slash commands.
List of available commands:
- `/help` - get info about bot and list of existing commands
- `/create` - add lfg message to the lfg channel. The command will create a form, where the user will be prompted to complete the survey. Users' answers will be collected into an embed and sent to the lfg channel.
- `/ping` - Writes ```alive and waiting for your commands``` in the chat if the bot is working. This command is created to check if the bot is responsive.

## Environment setup
1. Install NodeJS
2. Clone repo
3. Fetch all required npm packages using ```npm install```
4. Configure .env (use .env.sample as a reference if needed)
5. After any changes in code, in cmd call ```tsc```
6. Start the app by using ```nodemon build/main.js``` or debug it with your IDE  
