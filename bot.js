const tmi = require('tmi.js');
const express = require('express');
const helmet = require("helmet");
const { onCommandHandler } = require('./commandcontroller');
const { onSneezeHandler, initSneeze } = require('./sneezecontroller');
const { initEmotes, onEmoteHandler } = require('./emotecontroller');
const { startPokemon } = require('./pokemoncontroller');
const db = require('./db');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();
app.use(helmet());

const emoticons = ['LUL', 'PogChamp', 'HeyGuys', 'DansGame', '4Head', 'Kreygasm']; // Initializing with some popular global emotes
let sneeze = false;

// Define configuration options
const opts = {
    options: {
        clientId: process.env.CLIENT_ID
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: [
        process.env.CHANNEL_NAME
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch
client.connect();

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignores messages from the bot

    // Responds to emote hype. If last NUM_MSG_CHECK msgs contain at least 3 of the same emote, then contribute to the hype
    onEmoteHandler(target, msg, client, emoticons);

    // If bot hasn't sneezed, it attempts to sneeze with a 0.1% chance per message
    if (sneeze === false) { sneeze = initSneeze(target, client); }
    if (sneeze === true) { sneeze = onSneezeHandler(target, msg, client); }

    // Check if msg is a command
    if (msg.startsWith('!')) {
        const commandName = msg.trim();   // Remove whitespace from chat message
        await onCommandHandler(target, context, commandName, client);    // Handle the command
    }
}

// Called everytime the bot connects to Twitch chat
async function onConnectedHandler (addr, port) {
    // await initEmotes(emoticons);

    console.log(`* Connected to ${addr}:${port}`);

    // Change client color
    client.color('HotPink');

    // Declare the glorious arrival of Bunni Senpai Bot
    client.say(process.env.CHANNEL_NAME, 'Bunni Senpai has arrived! dittoDumper');
}

// This is necessary to prevent heroku from disconnecting
app.listen(port, () => {
   console.log(`listening on port ${port}`);
});