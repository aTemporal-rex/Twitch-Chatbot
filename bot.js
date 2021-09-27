const tmi = require('tmi.js');
const express = require('express');
const helmet = require("helmet");
const { onCommandHandler } = require('./controllers/commandcontroller');
const { onSneezeHandler, initSneeze } = require('./controllers/sneezecontroller');
const { initEmotes, onEmoteHandler } = require('./controllers/emotecontroller');
const { checkDuelResult } = require('./controllers/pokemoncontroller');
const db = require('./db');
const { onFartHandler } = require('./controllers/fartcontroller');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();
app.use(helmet());

const reUserBan = /^hoss|^ho.*ss|^pi[A-Za-z]{8,}/,
      reStreamlabs = /Thank you for following hoss|Thank you for following ho.*ss|Thank you for following pi[A-Za-z]{8,}/;

// Initializing with some popular global emotes, and sub emotes
const emoticons = [
    'LUL', 'PogChamp', 'HeyGuys', 'DansGame', '4Head', 'Kreygasm',  'jlastGuobafart', 'jlastGuobabutt', 'jlastMeltyangry', 'jlastHehe',
    'jlastAngyxiangling', 'jlastGuoba', 'jlastYummy', 'jlastXiangIsFine', 'jlastMeaty', 'jlastIllegal', 'jlastBunnysenpai', 'jlastHype',
    'jlastHammer', 'jlastSmug', 'jlastUsacry', 'jlastAnger'
]; 

let sneeze = false, duel = false;

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

    if (reUserBan.test(context.username)) { 
        client.say(target, `/ban ${context.username}`);
    }

    if (context.username === 'streamlabs'){
        if (reStreamlabs.test(msg)) {
            const userToBan = msg.split(' ')[4].split('!')[0];
            client.say(target, `/ban ${userToBan}`)
        }
    }

    // Responds to emote hype. If last NUM_MSG_CHECK msgs contain at least 3 of the same emote, then contribute to the hype
    onEmoteHandler(target, msg, client, new RegExp(emoticons.join('|'), 'g'));

    // If bot hasn't sneezed, it attempts to sneeze with a 0.1% chance per message
    if (sneeze === false) { sneeze = initSneeze(target, client); }
    if (sneeze === true) { sneeze = onSneezeHandler(target, msg, client); }

    if (duel === true) { duel = checkDuelResult(context, msg); }

    onFartHandler(target, client, context);

    // Check if msg is a command
    if (msg.startsWith('!')) {
        const commandName = msg.trim();   // Remove whitespace from chat message
        await onCommandHandler(target, context, commandName, client);    // Handle the command
    }
}

// Called everytime the bot connects to Twitch chat
async function onConnectedHandler (addr, port) {
    await initEmotes(emoticons);

    console.log(`* Connected to ${addr}:${port}`);

    // Change client color
    client.color('HotPink');

    // Declare the glorious arrival of Bunni Senpai Bot
    client.say(process.env.CHANNEL_NAME, 'Bunni Senpai has arrived! jlastGuobafart');
}

// This is necessary to prevent heroku from disconnecting
app.listen(port, () => {
   console.log(`listening on port ${port}`);
});