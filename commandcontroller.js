const CommandModel = require('./command');
const { onQueueHandler } = require('./queuecontroller');
const { tellJoke } = require('./jokecontroller');
const { getAnime } = require('./animesgetter');
const { getManga } = require('./mangasgetter');
const { getPageCount } = require('./pagegetter');
const db = require('./db');
require('dotenv').config();

const options = {upsert: true, new: true, setDefaultsOnInsert: true };

const cooldown = 4000, // Command cooldown in milliseconds
      jokeCooldown = 45000;
const reMedia = /^!anime{1}?$|^!manga{1}?$/i,
      reGreater = /^!anime ?[0-9]{1,2}?$|^!manga ?[0-9]{1,2}?$/i,  // Regex checks if command !anime or !manga is followed by 1 or 2 digits
      reSimple = /^![\w]+$/i,
      reAdd = /^!baddcommand ![\w]+ [\w\W]*$/i,
      reDel = /^!bdelcommand ![\w]+$/i,
      reAddAlias = /^!baddalias ![\w]+ ![\w]+$/i,
      reDelAlias = /^!bdelalias ![\w]+ ![\w]+$/i,
      reJoke = /^!jokes?$|^!dadjokes?$/i,
      reQueue = /^!bstart$|^!bjoin$|^!bqueue$|^!bclear$|^!bnext ?\d{0,2}|^!bend$|^!bcurrent$|^!bclose$|^!bopen$/i,
      reCheck = /^!anime{1}?$|^!manga{1}?$|^!anime ?[0-9]{1,2}?$|^!manga ?[0-9]{1,2}?$|^![\w]+$/i;
let cmdOnCooldown = false, jokeOnCooldown = false, // Boolean to check if command is on cooldown
    animePageCount, mangaPageCount, avgScorePageCount, 
    averageScore;

// Get total number of pages for the total list of manga and anime
const getPageCounts = async () => {
    animePageCount = await getPageCount(`ANIME`);
    mangaPageCount = await getPageCount(`MANGA`);
}

// Get total number of pages for the anime or manga with an average score greater than or equal to the requested value
const getPageCountAvgScore = async (mediaType) => {
    avgScorePageCount = await getPageCount(mediaType, averageScore);
}

// Called everytime a command is given
async function onCommandHandler (target, context, commandName, client) {
    // If user is admin, sets value to true. Otherwise, sets value to false
    const ADMIN_PERMISSION = context.mod === true ? true : context.badges.broadcaster === '1' ? true : context.username === process.env.TWITCH_NAME ? true : false;
    
    // Initializes animePageCount and mangaPageCount if they are still undefined
    if (animePageCount === undefined || mangaPageCount === undefined) {
        await getPageCounts();
    }

    // If given command is on cooldown it will return
    if (onCooldown(commandName, ADMIN_PERMISSION)) { return; }

    // Checks if command matches regex for !anime{2 or 1 digits number} command
    // If it matches then it removes non-digits and assigns the digits to average score
    // Then it gets just the letters from the command, uppercases them, and passes them to the getPageCountAvgScore function
    if (reGreater.test(commandName)) {
        const mediaType = commandName.replace(/[^A-Za-z]+/g, '').toUpperCase();
        averageScore = commandName.replace(/\D/g, '');

        await getPageCountAvgScore(`${mediaType}`);
    }

    try {
        // If the command is known, let's execute it
        if (reMedia.test(commandName)) {

            logCommand(commandName);
            // Checks if command is !anime or !manga
            if (commandName === '!anime') {
                const anime = await getAnime('all', animePageCount);
                anime ? client.say(target, `Your next favorite anime is ${anime} TehePelo`) : console.log('Media was undefined');
            } else {
                const manga = await getManga('all', mangaPageCount);
                manga ? client.say(target, `Your next favorite manga is ${manga} TehePelo`) : console.log('Media was undefined');   
            }
            
        } else if (reGreater.test(commandName)) {

            logCommand(commandName);
            // Checks if index of first occurring a is 1. This would mean command is !anime[number]
            if (commandName.indexOf('a') === 1) {
                const anime = await getAnime('greater', avgScorePageCount, averageScore);
                anime ? client.say(target, `Your next favorite anime is ${anime} TehePelo`) : console.log('Media was undefined');
            } else {
                const manga = await getManga('greater', avgScorePageCount, averageScore);
                manga ? client.say(target, `Your next favorite manga is ${manga} TehePelo`) : console.log('Media was undefined');
            }

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
    const ADMIN_PERMISSION = context;

    if (ADMIN_PERMISSION) { return; } // If admin, ignore cooldown
    if (reQueue.test(commandName)) { return; } // Ignore cooldown for queue usage

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
        console.log(`\n* Executed ${commandName.toLowerCase()} command`);
        console.log(result); 
    } else if (result === null) {
        console.log(`* ${commandName} command not found`);
    } else {
        console.log(`\n* Executed ${commandName.toLowerCase()} command`);
    }
}

module.exports = {
    onCommandHandler
};