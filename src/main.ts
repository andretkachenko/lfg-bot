'use strict'

import express from "express";
const app = express();
app.get('/', (req, res) => res.send('LFG Bot is up and running'));
app.listen(process.env.PORT);

import { Bot } from './discord'

const client: Bot = new Bot()
client.start()
