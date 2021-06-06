const tmi = require('tmi.js');
const { getAnime } = require('./animesgetter');
const { getManga } = require('./mangasgetter');
const { getAnimePageCount, getMangaPageCount } = require('./pagegetter');
require('dotenv').config();

let animePageCount, mangaPageCount;

// Define configuration options
const opts = {
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

    // Remove whitespace from chat message
    const commandName = msg.trim();

    // Initializes animePageCount and mangaPageCount if they are still undefined
    if (animePageCount === undefined || mangaPageCount === undefined) {
        await getPageCounts();
    }

    // If the command is known, let's execute it
    if (commandName === '!anime' || commandName === '!Anime') {

        console.log(`* Executed ${commandName} command`);
        const media = await getAnime(animePageCount);
        if (media === undefined) {
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite anime is ${media} TehePelo`);
        // client.say(target, `Your next favorite anime is ${media.title.english ? media.title.english : media.title.romaji} ${media.siteUrl}`);

    } else if (commandName === '!manga' || commandName === '!Manga') {

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
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}