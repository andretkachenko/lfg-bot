'use strict'

import { Bot } from './discord'
import { application } from "express";

const client: Bot = new Bot()
client.start()

application.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200);
  });