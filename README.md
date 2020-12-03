# LFG
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)  [![Discord Bots](https://top.gg/api/widget/status/732697892292395110.svg?noavatar=true)](https://top.gg/bot/732697892292395110)  
Discord  Bot for event managing and looking for group.  
This simple bot will let you set up separate lfg channel, and then send event messages to show that you are looking for a group. Several lfg channels are supported as well.
All messages, which are not commands from [existing commands list](#existing-commands) will be deleted immediately (configurable, see commands).  
Commands will be deleted right after processing.  
To accept or decline event, a user can click on 👍 or 👎 emoji respectively.  
All other reactions will be deleted to prevent reaction spam and trolling (configurable, see commands).  

## Existing commands
List of available commands:
- `lfg help` - get info about bot and list of existing commands
- `lfg setup` - make this channel an lfg channel. Requires user to have 'Manage Channels' permission.
- `lfg ignore [message]` - add a message to the lfg channel that will not be deleted. Example: `lfg ignore This message is introductory thus should not be deleted` Requires user to have 'Manage Channels' permission.
- `lfg moderate #{channel} [0/1]` - enable/disable deletion of messages and reactions. Example: `lfg moderate #lfg 0` to disable moderation, `lfg moderate #lfg 1` to enable. Requires user to have 'Manage Channels' permission.
- `lfg start` - add lfg message to the lfg channel. New temp channel will be created, where the user will be prompted to complete the survey. User's answers will be collected into an embed and sent to the lfg channel. Works only in lfg channels.

## Want to use at your server?
[![Invite bot to your server](https://i.imgur.com/n8T9oOi.jpg)](https://discord.com/api/oauth2/authorize?client_id=732697892292395110&permissions=268692560&scope=bot)

## If you found a bug
If you have any issue with the bot functionality, feel free to post an issue in this repo - for now, I am intended to maintain this app as long as I don't feel it is stable enough.

## Need any adjustments?
If you feel some cool feature is missing, or you want to make some minor tweaks just for your quality of life - feel free to either post an issue in the repo or make a fork and adjust it yourself as you see fit.  
Please bear in mind: I intend to leave this bot single-purpose, meaning I won't add features which are not related to the idea of managing lfg channels.

## If you like the bot
LFG bot was approved by the top.gg administrators (one of the biggest aggregator for the Discord bots and servers)
If you feel the bot is worthy enough - you can vote for it at [its top.gg page](https://top.gg/bot/732697892292395110).
You can do it every 12 hours. Voting isn't required, but always appreciated) I will be glad to know that my work helps people achieve what they want.

## Environment setup
1. Install NodeJS
2. Clone repo
3. Fetch all required npm packages using ```npm install```
4. Configure .env (use .env.sample as a reference if needed)
5. After any changes in code, in cmd call ```tsc```
6. Start the app by using ```nodemon build/main.js``` or debug it with your IDE
