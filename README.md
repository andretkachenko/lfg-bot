# lfg-bot
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)  
Discord  Bot to set up #looking-for-group channel.  
This simple bot will let you set up separate lfg channel, and then send embedded messages to show that you are looking for a group.  
All messages, which are not commands from [existing commands list](#existing-commands) will be deleted immediately.  
Commands will be deleted right after processing.  
To accept or decline event, an user can click on 👍 or 👎 emoji respectively.  
All other reactions will be deleted in order to prevent reaction spam and trolling.  

## Table of Contents
- [Chronicler-bot](#lfg-bot)
- [Existing commands](#existing-commands)
- [Want to use at your server?](#want-to-use-at-your-server)
- [If you found a bug](#if-you-found-a-bug)
- [Need any adjustments?](#need-any-adjustments)
- [Environment setup](#environment-setup)
- [Deployment manual](#deployment-manual)
  * [Set up Discord bot account](#set-up-discord-bot-account)
  * [Set up MongoDB Atlas](#set-up-mongodb-atlas)
  * [Set up Heroku](#set-up-heroku)

## Existing commands
List of available commands:
- `lfg help` - get info about bot and list of existing commands
- `lfg setup` - make this channel an lfg channel. Bot will only react to messages in the lfg channel
- `lfg ignore [message]` - add message to the lfg channel. Other messages (ignoring commands) will be deleted immediately from lfg channel. Example: `lfg ignore This message is introductory thus should not be deleted`
- `lfg start` - add lfg message to the lfg channel. New temp channel will be created, where the user will be prompted to complete survey. User's answers will be collected into an embed and sent to the lfg channel.

## Want to use at your server?
Currently the bot is deployed via Heroku and MongoDB Atlas for personal usage.  
You can use it via [this link](https://discord.com/api/oauth2/authorize?client_id=732697892292395110&permissions=268692560&scope=bot)
In case bot will be shut down or set to be invite-only in future, you can deploy it yourself using [Deployment manual](#deployment-manual).

## If you found a bug
If you have any issue with the bot functionality, feel free to post an issue in this repo - for now, I am intended to maintain this app as long as I don't feel it is stable enough.

## Need any adjustments?
If you feel some really cool feature is missing, or you want to make some minor tweaks just for your own quality of life - feel free to either post an issue in the repo or make a fork and adjust it yourself as you see fit.

## Environment setup
1. Install NodeJS
2. Clone repo
3. Fetch all required npm packages using ```npm install```
4. Configure .env (use .env.sample as a reference if needed)
5. After any changes in code, in cmd call ```tsc```
6. Start the app by using ```nodemon build/main.js``` or debug it with your IDE

## Deployment manual
*You can change command prefix ('lfg ' by default) in your .env (PREFIX=lfg replace with PREFIX=your-sign')*
This bot was deployed by me using Heroku and MongoDB Atlas.

### Set up Discord bot account
1. Go to Discord Developer Portal
2. Click 'New Application', provide application name and click 'Create'
3. In the menu on left, go to the 'Bot' tab
4. Click 'Add Bot'
5. Copy Token from the created bot and save it in .env as TOKEN

### Set up MongoDB Atlas
1. Create MongoDB Atlas account
2. Add new Project
3. Build a Cluster
4. Choose a plan, region, cluster tier and cluster name
5. When your cluster is deployed, click on 'Connections'
6. Whitelist a connection IP address => Add a different IP Address => Add '0.0.0.0' to ensure Heroku is able to connect (Heroku uses dynamic IPs, so there's no way to whitelist just one IP)
7. Create a MongoDB User => Provide Username (save it in .env as MONGO_NAME) and Password (type or use autogenerate button; save it in .env as MONGO_PWD)
8. Click 'Choose connection method'
9. Choose 'Connect your application'
10. You'll be provided with a connection link. For example: ```mongodb+srv://<username>:<password>@cluster0-dxnlr.mongodb.net/test?retryWrites=true&w=majority```
11. Save part after '@' sign in .env as MONGO_CLUSTER. In this case, ```MONGO_CLUSTER=cluster0-dxnlr.mongodb.net/test?retryWrites=true&w=majority```

### Set up Heroku
1. Create a Heroku account
2. Create a New Pipeline
3. Connect Pipeline to the Github repository
4. Open pipeline
5. Add app to staging/production 
6. Open app
7. Go to the Settings tab
8. In Config Vars section, insert all configurations from .env file (except NODE_ENV, this one is provided by default)
9. Go to Deploy tab and ensure Automatic deploy is enabled for master branch

