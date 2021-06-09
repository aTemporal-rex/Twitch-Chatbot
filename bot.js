const tmi = require('tmi.js');
const { getAnime } = require('./animesgetter');
const { getManga } = require('./mangasgetter');
const { getPageCount } = require('./pagegetter');
require('dotenv').config();

const cooldown = 3000;                  // Command cooldown in milliseconds
const regex = /^!anime[0-9]{1,2}?$/,    // Regex checks if command !anime is followed by 1 or 2 digits
      regex1 = /^!anime[0-9]{1}?$/,     // Regex checks if command !anime is followed by 1 digit
      regex2 = /^!anime[0-9]{2}?$/;     // Regex checks if command !anime is followed by 2 digits
let timePrevCmd = 0,                    // Time at which previous command was used; used for cooldown
    animePageCount, mangaPageCount, avgScorePageCount,
    averageScore;

// Define configuration options
const opts = {
    options: {
        clientId: process.env.CLIENT_ID
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

// Get total number of pages for the total list of manga and anime
const getPageCounts = async () => {
    animePageCount = await getPageCount(`ANIME`);
    mangaPageCount = await getPageCount(`MANGA`);
}

// Get total number of pages for the anime or manga with an average score greater than or equal to the requested value
const getPageCountAvgScore = async () => {
    avgScorePageCount = await getPageCount(`ANIME`, averageScore);
}

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignores messages from the bot

    // Check if msg is a command
    if (msg.startsWith('!')) {
        const commandName = msg.trim().toLowerCase();   // Remove whitespace from chat message and make it lowercase
        await onCommandHandler(target, commandName);    // Handle the command
    }
}

// Called everytime the bot connects to Twitch chat
async function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    // Change client color
    client.color('HotPink');

    // Declare the glorious arrival of Bunny Senpai Bot
    client.say(process.env.CHANNEL_NAME, 'Bunny Senpai has arrived! dittoDumper');
}

// Called everytime a command is given
async function onCommandHandler (target, commandName) {
    // Initializes animePageCount and mangaPageCount if they are still undefined
    if (animePageCount === undefined || mangaPageCount === undefined) {
        await getPageCounts();
    }

    // Manages a global command cooldown
    if (commandName === '!anime' || commandName === '!manga' || regex.test(commandName)) {
        if (timePrevCmd >= (Date.now() - cooldown)) {
            console.log('Command is on cooldown.');
            return; 
        }
        timePrevCmd = Date.now();
    }

    // Checks if the last 2 characters are numbers, then checks if last 1 character is a number
    if (regex2.test(commandName)) {
        averageScore = parseInt(commandName.substr(-2));
        await getPageCountAvgScore();
        console.log(avgScorePageCount);
    }
    else if (regex1.test(commandName)) {
        averageScore = parseInt(commandName.substr(-1));
        await getPageCountAvgScore();
        console.log(avgScorePageCount);
    }
    
    // If the command is known, let's execute it
    if (commandName === '!anime') {

        console.log(`* Executed ${commandName} command`);
        const media = await getAnime('all', animePageCount);
        if (media === undefined) {
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite anime is ${media} TehePelo`);

    } else if (commandName === '!manga') {

        console.log(`* Executed ${commandName} command`);
        const media = await getManga('all', mangaPageCount);
        if (media === undefined) {
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite manga is ${media} TehePelo`);

    } else if (commandName === `!anime${averageScore}`) {
        
        console.log(`* Executed ${commandName} command`);
        const media = await getAnime('aboveAvgScore', avgScorePageCount, averageScore);
        if (media === undefined) {
            return;
        }
        client.say(target, `Your next favorite anime is ${media} TehePelo`);

    } else {
        console.log(`* Unknown command ${commandName}`);
    }
}

// This is necessary to prevent heroku from disconnecting
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`listening on port ${port}`);
});