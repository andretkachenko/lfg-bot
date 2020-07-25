'use strict'

import { Bot } from './discord'
import * as express from "express";
import * as https from 'https';

const client: Bot = new Bot()
client.start()

const app = express();
app.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200);
  });
  app.listen(process.env.PORT);
  setInterval(() => {
    https.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
  }, 280000);