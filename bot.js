const tmi = require('tmi.js');
const { getAnime } = require('./animesgetter');
const { getManga } = require('./mangasgetter');
require('dotenv').config();

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

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignores messages from the bot

    // Remove whitespace from chat message
    const commandName = msg.trim();

    // If the command is known, let's execute it
    if (commandName === '!anime' || commandName === '!Anime') {

        console.log(`* Executed ${commandName} command`);
        const media = await getAnime();
        if (media === undefined) {
            client.say(target, 'Page count needs to be updated');
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite anime is ${media}`);
        // client.say(target, `Your next favorite anime is ${media.title.english ? media.title.english : media.title.romaji} ${media.siteUrl}`);

    } else if (commandName === '!manga' || commandName === '!Manga') {

        console.log(`* Executed ${commandName} command`);
        const media = await getManga();
        if (media === undefined) {
            client.say(target, 'Page count needs to be updated');
            console.log('Page count needs to be updated');
            return;
        }
        client.say(target, `Your next favorite manga is ${media}`);
        // client.say(target, `Your next favorite manga is ${media.title.english ? media.title.english : media.title.romaji} ${media.siteUrl}`);

    } else {
        console.log(`* Unknown command ${commandName}`);
    }
}

// Called everytime the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`)
}