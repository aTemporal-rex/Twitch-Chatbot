const tmi = require('tmi.js');
const express = require('express');
const helmet = require("helmet");
const { getAnime } = require('./animesgetter');
const { getManga } = require('./mangasgetter');
const { getPageCount } = require('./pagegetter');
const { getJoke, tellJoke } = require('./jokes');
const { onSneezeHandler, initSneeze } = require('./sneezecontroller');
const { initEmotes, onEmoteHandler } = require('./emotecontroller');
const { onQueueHandler } = require('./queuecontroller');
const CommandModel = require('./command');
const db = require('./db');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();
app.use(helmet());

const options = {upsert: true, new: true, setDefaultsOnInsert: true };

const emoticons = [];

const cooldown = 4000,               // Command cooldown in milliseconds
      jokeCooldown = 45000;
const reAnime = /^!anime{1}?$/i,
      reManga = /^!manga{1}?$/i,
      reAnimeS = /^!anime ?[0-9]{1,2}?$/i,  // Regex checks if command !anime is followed by 1 or 2 digits
      reMangaS = /^!manga ?[0-9]{1,2}?$/i,  // Regex checks if command !manga is followed by 1 or 2 digits
      reSimple = /^![\w]+$/i,
      reAdd = /^!baddcommand ![\w]+ [\w\W]*$/i,
      reDel = /^!bdelcommand ![\w]+$/i,
      reAddAlias = /^!baddalias ![\w]+ ![\w]+$/i,
      reDelAlias = /^!bdelalias ![\w]+ ![\w]+$/i,
      reJoke = /^!jokes?$|^!dadjokes?$/i,
      reQueue = /^!bstart$|^!bjoin$|^!bqueue$|^!bclear$|^!bnext\d{0,2}|^!bend$|^!bcurrent$/i,
      reCheck = /^!anime{1}?$|^!manga{1}?$|^!anime ?[0-9]{1,2}?$|^!manga ?[0-9]{1,2}?$|^![\w]+$/i;
let cmdOnCooldown = false, jokeOnCooldown = false,                 // Time at which previous command was used; used for cooldown
    animePageCount, mangaPageCount, avgScorePageCount,
    averageScore,
    sneeze = false;

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

// Get total number of pages for the total list of manga and anime
const getPageCounts = async () => {
    animePageCount = await getPageCount(`ANIME`);
    mangaPageCount = await getPageCount(`MANGA`);
}

// Get total number of pages for the anime or manga with an average score greater than or equal to the requested value
const getPageCountAvgScore = async (mediaType) => {
    avgScorePageCount = await getPageCount(mediaType, averageScore);
}

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignores messages from the bot

    // Responds to emote hype. If last NUM_MSG_CHECK msgs contain at least 3 of the same emote, then contribute to the hype
    onEmoteHandler(target, msg, client, emoticons);

    // If bot hasn't sneezed, it attempts to sneeze with a 3% chance per message
    if (sneeze === false) { sneeze = initSneeze(target, client); }
    if (sneeze === true) { sneeze = onSneezeHandler(target, msg, client); }

    // Check if msg is a command
    if (msg.startsWith('!')) {
        const commandName = msg.trim();   // Remove whitespace from chat message
        await onCommandHandler(target, context, commandName);    // Handle the command
    }
}

// Called everytime the bot connects to Twitch chat
async function onConnectedHandler (addr, port) {
    // await initEmotes(emoticons);

    console.log(`* Connected to ${addr}:${port}`);

    // Change client color
    client.color('HotPink');

    // Declare the glorious arrival of Bunny Senpai Bot
    client.say(process.env.CHANNEL_NAME, 'Bunny Senpai has arrived! dittoDumper');
}

// Called everytime a command is given
async function onCommandHandler (target, context, commandName) {
    const ADMIN_PERMISSION = context.mod || process.env.TWITCH_NAME || context.badges.broadcaster;
    
    // Initializes animePageCount and mangaPageCount if they are still undefined
    if (animePageCount === undefined || mangaPageCount === undefined) {
        await getPageCounts();
    }

    // If given command is on cooldown it will return
    if (onCooldown(commandName, ADMIN_PERMISSION)) { return; }

    // Checks if command matches regex for !anime{2 or 1 digits number} command
    // If it matches then it removes non-digits and assigns the digits to average score
    // Then it gets just the letters from the command, uppercases them, and passes them to the getPageCountAvgScore function
    if (reAnimeS.test(commandName) || reMangaS.test(commandName)) {
        const mediaType = commandName.replace(/[^A-Za-z]+/g, '').toUpperCase();
        averageScore = commandName.replace(/\D/g, '');

        await getPageCountAvgScore(`${mediaType}`);
    }
    try {
        // If the command is known, let's execute it
        if (reAnime.test(commandName)) {

            logCommand(commandName);
            const media = await getAnime('all', animePageCount);
            if (media === undefined) {
                console.log('Media was undefined');
                return;
            }
            client.say(target, `Your next favorite anime is ${media} TehePelo`);

        } else if (reManga.test(commandName)) {
            
            logCommand(commandName);
            const media = await getManga('all', mangaPageCount);
            if (media === undefined) {
                console.log('Media was undefined');
                return;
            }
            client.say(target, `Your next favorite manga is ${media} TehePelo`);

        } else if (reAnimeS.test(commandName)) {

            logCommand(commandName);
            const media = await getAnime('greater', avgScorePageCount, averageScore);
            if (media === undefined) {
                console.log('Media was undefined');
                return;
            }
            client.say(target, `Your next favorite anime is ${media} TehePelo`);

        } else if (reMangaS.test(commandName)) {

            logCommand(commandName);
            const media = await getManga('greater', avgScorePageCount, averageScore);
            if (media === undefined) {
                console.log('Media was undefined');
                return;
            }
            client.say(target, `Your next favorite manga is ${media} TehePelo`);
            
        } else if (reAdd.test(commandName) && ADMIN_PERMISSION) {
            
            const newCommand = {
                name: commandName.split(' ').slice(1, 2).toString(),
                response: commandName.split(' ').slice(2).join(' ').toString()
            };

            const filter = {
                name: newCommand.name
            };

            // Search for newCommand.name in database. If it's there, then update document with newCommand using options = {upsert: true, new: true}
            // If it's not there, then create it
            const result = await CommandModel.findOneAndUpdate(filter, newCommand, options);
            logCommand(commandName, result);

        } else if (reDel.test(commandName) && ADMIN_PERMISSION) {

            // filter uses an $or operator to select a document based on name or alias
            const filter = {
                $or: [{ name: commandName.split(' ').slice(1).toString() }, { alias: commandName.split(' ').slice(1).toString() }]
            };

            // Removes the given command if it exists
            const result = await CommandModel.findOneAndDelete(filter);
            logCommand(commandName, result);

        } else if (reAddAlias.test(commandName) && ADMIN_PERMISSION) {
            
            const filter = {
                name: commandName.split(' ').slice(1, 2).toString()
            };

            const alias = {
                alias: commandName.split(' ').slice(2).toString()
            };

            // Finds a command based on its name, then adds the given alias to the alias array
            const result = await CommandModel.findOneAndUpdate(filter, {$push: alias}, {new: true});
            logCommand(commandName, result);

        } else if (reDelAlias.test(commandName) && ADMIN_PERMISSION) {

            const filter = {
                name: commandName.split(' ').slice(1, 2).toString()
            };

            const alias = {
                alias: commandName.split(' ').slice(2).toString()
            };

            const result = await CommandModel.findOneAndUpdate(filter, {$pull: alias}, {new: true});
            logCommand(commandName, result);

        } else if (reJoke.test(commandName)) {

            logCommand(commandName);
            await tellJoke(target, client, commandName);
            
        } 
        else if (reQueue.test(commandName)) {

            logCommand(commandName);
            
            // Handles all queue functionality
            onQueueHandler (target, context, commandName, client);

        } 
        else if (reSimple.test(commandName)) {
            
            const filter = {
                $or: [{ name: commandName }, { alias: commandName }]
            };

            const result = await CommandModel.findOne(filter);
            if (result) client.say(target, `${result.response}`);
            logCommand(commandName, result);

        } else {
            console.log(`* Unknown command ${commandName}`);
        }

    } catch (err) {
        console.log(err);
    }
}

const onCooldown = (commandName, context) => {

    if (reQueue.test(commandName)) { return; }

    // Manages joke cooldown, and a global cooldown
    if (reJoke.test(commandName)) {
        if (jokeOnCooldown) {
            console.log('Command is on cooldown');
            return true;
        } else {
            jokeOnCooldown = true;
            setTimeout(() => { jokeOnCooldown = false; }, jokeCooldown);
        }
    } else if (reCheck.test(commandName)) {
        if (cmdOnCooldown) {
            console.log('Command is on cooldown');
            return true;
        } else {
            cmdOnCooldown = true;
            setTimeout(() => { cmdOnCooldown = false; }, cooldown);
        }
    }
}

// Logs the inputted command depending on what type of command it is
const logCommand = (commandName, result) => {
    if (result) { 
        console.log(`* Executed ${commandName.toLowerCase()} command`);
        console.log(result); 
    } else if (result === null) {
        console.log(`* ${commandName} command not found`);
    } else {
        console.log(`* Executed ${commandName.toLowerCase()} command`);
    }
}

// This is necessary to prevent heroku from disconnecting
app.listen(port, () => {
   console.log(`listening on port ${port}`);
});