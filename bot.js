const tmi = require('tmi.js');
const { getAnime } = require('./animesgetter');
const { getManga } = require('./mangasgetter');
const { getAnimePageCount, getMangaPageCount } = require('./pagegetter');
require('dotenv').config();

const cooldown = 3000; // Command cooldown in milliseconds
let cmdLastUsed = 0; // Time last command was used
let animePageCount, mangaPageCount;

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

// Get total number of pages for the list of manga or anime
const getPageCounts = async () => {
    animePageCount = await getAnimePageCount();
    mangaPageCount = await getMangaPageCount();
}

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignores messages from the bot

    // Remove whitespace from chat message and make it lowercase
    const commandName = msg.trim().toLowerCase();

    // Initializes animePageCount and mangaPageCount if they are still undefined
    if (animePageCount === undefined || mangaPageCount === undefined) {
        await getPageCounts();
    }

    // Manages a global command cooldown
    if (commandName === "!anime" || commandName === "!manga") {
        if (cmdLastUsed >= (Date.now() - cooldown)) {
            console.log("Command is on cooldown.");
            return; 
        }

        cmdLastUsed = Date.now();
    }

    // If the command is known, let's execute it
    if (commandName === '!anime') {

        console.log(`* Executed ${commandName} command`);
        const media = await getAnime(animePageCount);
        if (media === undefined) {
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite anime is ${media} TehePelo`);
        // client.say(target, `Your next favorite anime is ${media.title.english ? media.title.english : media.title.romaji} ${media.siteUrl}`);

    } else if (commandName === '!manga') {

        console.log(`* Executed ${commandName} command`);
        const media = await getManga(mangaPageCount);
        if (media === undefined) {
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite manga is ${media} TehePelo`);
        // client.say(target, `Your next favorite manga is ${media.title.english ? media.title.english : media.title.romaji} ${media.siteUrl}`);

    } else {
        console.log(`* Unknown command ${commandName}`);
    }
}

// Called everytime the bot connects to Twitch chat
async function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    // Change client color
    client.color("HotPink");

    // Declare the glorious arrival of Bunny Senpai Bot
    client.say(process.env.CHANNEL_NAME, "Bunny Senpai has arrived! dittoDumper");
}

// This is necessary to prevent heroku from disconnecting
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`listening on port ${port}`);
});