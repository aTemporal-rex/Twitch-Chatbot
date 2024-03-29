const CommandModel = require('../models/command');
const PokemonModel = require('../models/pokemon');
const { onQueueHandler } = require('./queuecontroller');
const { onLoopHandler } = require('./timercontroller');
const { tellJoke } = require('./jokecontroller');
const { getChosenPokemon, evolve, onDuel, startPokemon, stopPokemon } = require('./pokemoncontroller');
const { getAnime } = require('../animesgetter');
const { getManga } = require('../mangasgetter');
const { getPageCount } = require('../pagegetter');
const { rollDice } = require('./rolldice');
const db = require('../db');
// const pokemon = require('../models/pokemon');
const { get } = require('request');
require('dotenv').config();

const options = {upsert: true, new: true, setDefaultsOnInsert: true };

const cooldown = 4000, // Command cooldown in milliseconds
      rollCooldown = 10000,
      jokeCooldown = 40000;

const reMedia = /^!anime$|^!manga$/i,
      reGreater = /^!anime ?[0-9]{1,2}?$|^!manga ?[0-9]{1,2}?$/i,  // Regex checks if command !anime or !manga is followed by 1 or 2 digits
      reSimple = /^![\w]+$/i,
      reSay = /^!say [\w\W]*$/i,
      reAdd = /^(?:!baddcommand|!baddcom) ![\w]+ [\w\W]*$/i,
      reDel = /^(?:!bdelcommand|!bdelcom) ![\w]+$/i,
      reAddAlias = /^!baddalias ![\w]+ ![\w]+$/i,
      reDelAlias = /^!bdelalias ![\w]+ ![\w]+$/i,
      reJoke = /^!jokes?$|^!dad ?jokes?$/i,
      reQueue = /^!bstart$|^!join$|^!bqueue$|^!bclear$|^!next ?\d{0,2}|^!bend$|^!bcurrent$|^!bclose$|^!bopen$|^!bpos$/i,
      reLoop = /^!loop ?\d{1,2} [\w\W]*$/i,
      reEndLoop = /^!endloop$/i,
      reSpook = /^!spook ?\d{0,3}$|^!scare ?\d{0,3}$|^(!scount|!spookcount|!scarecount)$/i,
      reDeath = /^!death ?\d{0,3}$|^!ded ?\d{0,3}$|^(!dcount|!deathcount|!dedcount)$/i,
      rePokemon = /^!catch [\w]+$|^!startpokemon$|^(!mypokemons?|!mypokes)$|^(!endpokemon|!stoppokemon)$|^(!avatars? [\w]+)|^(!duel [\w]+)|^(!evolve [\w]+)/i,
      reDice = /^!roll d\d\d?\d?$/i,
      reCheck = /^!anime?$|^!manga?$|^!anime ?[0-9]{1,2}?$|^!manga ?[0-9]{1,2}?$/i;
      
let cmdOnCooldown = false, jokeOnCooldown = false, rollOnCooldown = false, cmdFound = false, // Boolean to check if command is on cooldown, as well as if cmd is found
    animePageCount, mangaPageCount, avgScorePageCount, scareCount = 0, deathCount = 0,
    averageScore, nIntervId, pokeIntervId, chosenPokemon;

const commands = [];

// Whenever the commands collection is changed, it triggers this event that updates the local commands array
const commandEventEmitter = CommandModel.watch();
commandEventEmitter.on('change', change => {
    changeJson = change;
    try {

        if (changeJson.operationType === "insert") {
            console.log("\n** Document Inserted **");

            // Add new document to local commands array
            commands.push(changeJson.fullDocument);
    
        } else if (changeJson.operationType === "update") {
            console.log("\n** Document Updated **");
    
            // Get index of updated command from local array
            cmdIndex = commands.findIndex(command => command._id.toString() == changeJson.documentKey._id.toString());
    
            // Update each value locally that was changed in the database
            Object.keys(changeJson.updateDescription.updatedFields).forEach(key => {
                commands[cmdIndex][`${key}`] = changeJson.updateDescription.updatedFields[`${key}`]
            });  
        } else if (changeJson.operationType === "delete") {
            console.log("\n ** Document Deleted **");

            // Get index of deleted command from local array
            cmdIndex = commands.findIndex(command => command._id.toString() == changeJson.documentKey._id.toString());

            // Remove command from commands array
            commands.splice(cmdIndex, 1);
        }
        
    } catch (err) {
        console.error(err);
    }
    
    console.log(change);
});

async function getCommands() {
    cmds = await CommandModel.find();
    cmds.forEach(command => 
        commands.push({
            _id: command._id,
            name: command.name,
            response: command.response,
            permission: command.permission,
            cooldown: command.cooldown,
            onCooldown: command.onCooldown,
            alias: command.alias
        })
    );
    return commands;
}

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
    const ADMIN_PERMISSION = context.mod === true ? true : context['user-id'] === context['room-id'] ? true : context['display-name'] === process.env.CHANNEL_NAME ? true : false;
    const userPermission = getPermission(context);

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
            // Checks if index of first occurring a is 1. This would mean command is !anime[number] rather than !manga[number]
            if (commandName.indexOf('a') === 1) {
                const anime = await getAnime('greater', avgScorePageCount, averageScore);
                anime ? client.say(target, `Your next favorite anime is ${anime} TehePelo`) : console.log('Media was undefined');
            } else {
                const manga = await getManga('greater', avgScorePageCount, averageScore);
                manga ? client.say(target, `Your next favorite manga is ${manga} TehePelo`) : console.log('Media was undefined');
            }

        } else if (reSay.test(commandName) && ADMIN_PERMISSION) {
            
            logCommand(commandName);

            const msg = commandName.split(' ').slice(1).join(' ');
            client.say(target, msg);

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

        } else if (rePokemon.test(commandName)) {

            // Handle !startpokemon command
            if (commandName.toLowerCase() === '!startpokemon' && ADMIN_PERMISSION) {

                logCommand(commandName);
                pokeIntervId = await startPokemon(client, target, pokeIntervId, () => {
                    chosenPokemon = getChosenPokemon();
                });

            // Group [1] is !mypokemon and !mypokes
            } else if (rePokemon.exec(commandName)[1]) {

                logCommand(commandName);
                const filter = { trainerId: context['user-id'] };
                const result = await PokemonModel.findOne(filter);

                if (result === null) { return; }
                
                let myPokemon = result.pokemon.map(pokemon =>  pokemon.name).join(' - ');

                // Replace pokemon with corresponding twitch emote
                if (myPokemon.includes('Squirtle')) { 
                    myPokemon = myPokemon.replace(/\bSquirtle\b/g, 'SquirtleJam');
                } 

                if (myPokemon.includes('Bulbasaur')) {
                    myPokemon = myPokemon.replace(/\bBulbasaur\b/g, 'bulbaDance');
                } 

                if (myPokemon.includes('Charmander')) {
                    myPokemon = myPokemon.replace(/\bCharmander\b/g, 'RareChar');
                }

                if (myPokemon.includes('Ditto')) {
                    myPokemon = myPokemon.replace(/\bDitto\b/g, 'dittoDumper');
                }

                if (myPokemon.includes('Mew')) {
                    myPokemon = myPokemon.replace(/\bMew\b/g, 'MewSpin');
                }

                client.say(target, `${context['display-name']}'s Pokemon: ${myPokemon}`);
                console.log(`${context['display-name']}'s Pokemon: ${myPokemon}`);
                

            // Group [2] is !endpokemon and !stoppokemon
            } else if (rePokemon.exec(commandName)[2] && ADMIN_PERMISSION) {

                logCommand(commandName);
                stopPokemon(pokeIntervId);

            // Handles selectPokemon command
            } else if (rePokemon.exec(commandName)[3]) {
                const trainerId = { trainerId: context['user-id'] };

                // Get trainer info
                const trainer = await PokemonModel.findOne(trainerId);

                const requestedPokemon = trainer.pokemon.find(pokemon => pokemon.name.toLowerCase() === commandName.split(' ')[1].toLowerCase());
                let selectedPokemon = trainer.selectedPokemon;

                // If trainer does not have the requested pokemon, then return
                if (requestedPokemon === undefined) { return; }

                // If no pokemon selected, assign requested pokemon as selected
                if (selectedPokemon.name === null) { 
                    selectedPokemon = requestedPokemon; 
                    return;
                }
                
                // Check if the trainer already has requested pokemon selected
                if (requestedPokemon.name != selectedPokemon.name) {

                    const findPokemon = trainer.pokemon.find(pokemon => pokemon.name === selectedPokemon.name);

                    // This somehow updates the wins of the pokemon whenever a new selectedPokemon is chosen
                    await PokemonModel.findOneAndUpdate({trainerId: context['user-id'], pokemon: { $elemMatch: { name: findPokemon.name }}}, { $set: { "pokemon.$.wins" : selectedPokemon.wins }});

                    // Sets selectedPokemon equal to the requested pokemon
                    await PokemonModel.updateOne(trainerId, { selectedPokemon: requestedPokemon });
                }


            // Handles duels
            } else if (rePokemon.exec(commandName)[4]) {
                onDuel(context)

            // Handles pokemon evolution
            } else if (rePokemon.exec(commandName)[5]) {
                const trainerId = { trainerId: context['user-id'] };

                const trainer = await PokemonModel.findOne(trainerId);

                const pokemon = trainer.pokemon.find(pokemon => pokemon.name.toLowerCase() === commandName.split(' ')[1].toLowerCase());

                if (pokemon === undefined) { 
                    return; 
                } else if (pokemon.wins >= 5) {
                    const evolvedPokemon = evolve(pokemon.name);

                    if (evolvedPokemon) {
                        client.say(target, `What? ${pokemon.name.toUpperCase()} is evolving!`);

                        // Move this to pokemoncontroller.js since it doesn't need to be a command
                        // setTimeout(function () {
                        //     if (B pressed) {
                        //         `Huh? ${pokemon.name.toUpperCase()} stopped evolving!`
                        //     } else {
                        //         `Congratulations! Your ${pokemon.name.toUpperCase()} evolved into ${evolvedPokemon}!`
                        //     }
                        // }, 10000);
                        setTimeout(function () {
                                if ((commandName === '!b' || commandName === '!B') && context['user-id'] === trainer.trainerId) {
                                    client.say(target, `Huh? ${pokemon.name.toUpperCase()} stopped evolving!`);
                                } else {
                                    client.say(target, `Congratulations! Your ${pokemon.name.toUpperCase()} evolved into ${evolvedPokemon}!`);
                                }
                            }, 10000);
                    }
                }

            // Handles !catch pokemon command
            } else {

                if (chosenPokemon === undefined) { return; } // If pokemon hasn't appeared yet then return

                const pokemon = commandName.split(' ').slice(1).join(' ').toString().toLowerCase();
                if (pokemon === chosenPokemon.name.toLowerCase()) {
                    logCommand(commandName);
                    client.say(target, `Gotcha! ${chosenPokemon.name.toUpperCase()} was caught! pokeCatch`);
                    console.log(`Gotcha! ${chosenPokemon.name.toUpperCase()} was caught!`);
                    
                    const filter = { trainerId: context['user-id'] };
                    const newPokemon = { pokemon: {name: chosenPokemon.name[0].toUpperCase() + chosenPokemon.name.slice(1).toLowerCase()} };
                    chosenPokemon = undefined;

                    const result = await PokemonModel.findOneAndUpdate(filter, { trainer: context['display-name'], $push: newPokemon}, options);
                }

            }

        } else if (reDice.test(commandName)) {
            const sides = commandName.split(' ')[1].replace(/\D/g, '');

            if (sides == 0) { 
                client.say(target, `peepoSnow`);
                return;
            }

            const num = rollDice(sides);

            if (num === 69) {
                client.say(target, `${context['display-name']} rolled a ${num}! Nice.`);
            } else if (num === 420) {
                client.say(target, `${context['display-name']} rolled a ${num}! Blaze it`);
            } else if (num === 1) {
                client.say(target, `${context['display-name']} rolled a ${num}! Are you trying to roleplay as Jackie rn? jlastHehe`);
            } else if (num === 999) {
                client.say(target, `${context['display-name']} rolled a ${num}! Secret ultra prize PADORUdefault`);
            } else {
                client.say(target, `${context['display-name']} rolled a ${num}! Congrats, you win nothing!`);
            }

        } else if (reJoke.test(commandName)) {

            logCommand(commandName);
            await tellJoke(target, client, commandName);
            
        } else if (reQueue.test(commandName)) {

            logCommand(commandName);
            
            // Handles all queue functionality
            onQueueHandler (target, context, commandName.toLowerCase(), client);

        } else if (reLoop.test(commandName) && ADMIN_PERMISSION) {

            logCommand(commandName);

            // Gets the first word of command string
            const firstWord = commandName.split(' ').slice(0, 1).toString();

            // Seeing if first word has a number in it. This is to check for optional space for !loop [number] command
            if (/\d/.test(firstWord)) { 
                const interval = firstWord.replace(/\D/g, '') * 60000;
                const msg = commandName.split(' ').slice(1).join(' ').toString();

                nIntervId = onLoopHandler(msg, interval, target, client, nIntervId);
            } else {
                const interval = commandName.split(' ').slice(1, 2).toString() * 60000;
                const msg = commandName.split(' ').slice(2).join(' ').toString();

                nIntervId = onLoopHandler(msg, interval, target, client, nIntervId);
            }

        } else if (reEndLoop.test(commandName) && ADMIN_PERMISSION) {

            logCommand(commandName);
            nIntervId ? clearInterval(nIntervId) : console.log('No currently active loop');

        } else if (reSpook.test(commandName)) {

            // Used to determine if command given is either !dcount or !deathcount
            const countCommand = reSpook.exec(commandName);

            // countCommand[1] is undefined unless command given is part of grouped commands
            if (countCommand[1]) {

                if (scareCount === 0) { return; }
                client.say(target, `Times Jackie felt the halloween spirit: ${scareCount} AUGH`);
                console.log(`Times Jackie felt the halloween spirit: ${scareCount}`);

            } else if (ADMIN_PERMISSION) {

                // Replace non digits with empty string, then check if string is empty
                if (commandName.replace(/\D/g, '').length === 0) { 
                    ++scareCount;
                    client.say(target, `Times Jackie felt the halloween spirit: ${scareCount} AUGH`);
                    console.log(`Times Jackie felt the halloween spirit: ${scareCount}`);
                }
                else { 
                    scareCount = commandName.replace(/\D/g, '');
                }
                
                // client.say(target, `spook count (${deathCount})`);
                console.log(`spook count be goin up (${scareCount})`);
            }

        } else if (reDeath.test(commandName)) {

            // Used to determine if command given is either !dcount or !deathcount
            const countCommand = reDeath.exec(commandName);

            // countCommand[1] is undefined unless command given is part of grouped commands
            if (countCommand[1]) {

                if (deathCount === 0) { return; }
                client.say(target, `Ded count: ${deathCount} AUGH`);
                console.log(`Ded count: ${deathCount}`);

            } else if (ADMIN_PERMISSION) {

                // Replace non digits with empty string, then check if string is empty
                if (commandName.replace(/\D/g, '').length === 0) { 
                    ++deathCount;
                    client.say(target, `Ded count: ${deathCount} AUGH`);
                    console.log(`Ded count: ${deathCount}`);
                }
                else { 
                    deathCount = commandName.replace(/\D/g, '');
                }
                
                // client.say(target, `spook count (${deathCount})`);
                console.log(`spook count be goin up (${deathCount})`);
            }

        } else if (reSimple.test(commandName)) {
            
            const filter = {
                $or: [{ name: commandName.toLowerCase() }, { alias: commandName.toLowerCase() }]
            };

            const result = await CommandModel.findOne(filter);
            
            try {
                const hasPermission = Object.keys(result.permission).some(key => result.permission[key] && userPermission[key]);

                // If user has permission and command exists
                if (hasPermission && result) {
                    if (ADMIN_PERMISSION === false) { cmdFound = true; } // If not admin and cmd is found, sets cmdFound to true
                    if (dbOnCooldown(result, ADMIN_PERMISSION)) { return; } // Uses result of DB search to see if cooldown needs to be enabled
                    client.say(target, `${result.response}`);

                    logCommand(commandName, result);
                }
                else { console.log('User does not have required permission!'); }
            } catch (ex) {
                console.log(ex)
            }

        } else {
            console.log(`* Unknown command ${commandName}`);
        }

    } catch (err) {
        console.log(err);
    }
}

const dbOnCooldown = (command, context) => {
    const ADMIN_PERMISSION = context.mod === true ? true : context['user-id'] === context['room-id'] ? true : context['display-name'] === process.env.CHANNEL_NAME ? true : false;

    if (ADMIN_PERMISSION === true) { return; } // If admin, ignore cooldown
    if (reQueue.test(command.name)) { return; } // Ignore cooldown for queue usage

    if (reSimple.test(command.name)) {
        const index = commands.findIndex(cmd => cmd.name === command.name)
        if (commands[index].onCooldown) {
            console.log('Command is on cooldown');
            return true;
        } else {
            // If command is found, enable command cooldown and reset cmdFound to false
            if (cmdFound) {
                // Set cooldown of command in local array to true
                commands[index].onCooldown = true;
                cmdFound = false;
                
                // Set onCooldown for this command to false after the assigned cooldown time
                setTimeout(() => { commands[index].onCooldown = false }, command.cooldown);

                return;
            } else {
                // If no command is found, then set cmdFound to false and return
                cmdFound = false;
                return;
            }
        }
    }
}

const onCooldown = (command, context) => {
    const ADMIN_PERMISSION = context.mod === true ? true : context['user-id'] === context['room-id'] ? true : context['display-name'] === process.env.CHANNEL_NAME ? true : false;

    if (ADMIN_PERMISSION === true) { return; } // If admin, ignore cooldown
    if (reQueue.test(command)) { return; } // Ignore cooldown for queue usage

    // Manages various cooldowns
    if (reJoke.test(command)) {

        if (jokeOnCooldown) {
            console.log('Command is on cooldown');
            return true;
        } else {
            jokeOnCooldown = true;
            setTimeout(() => { jokeOnCooldown = false; }, jokeCooldown);
        }
    } if (reDice.test(command)) {

        if (rollOnCooldown) {
            console.log('Command is on cooldown');
            return true;
        } else {
            rollOnCooldown = true;
            setTimeout(() => { rollOnCooldown = false; }, rollCooldown);
        }
    }
    else if (reCheck.test(command)) {

        if (cmdOnCooldown) {
            console.log('Command is on cooldown');
            return true;
        } else {
            cmdOnCooldown = true;
            setTimeout(() => { cmdOnCooldown = false; }, cooldown);
        }
    }
    else {
        cmdFound = false; 
        return false; 
    }
    //  else if (reSimple.test(command.name) || reSimple.test(command)) {
    //     // console.log(command.name)
    //     // console.log(command.cooldown)
    //     console.log("Reached resimple old")
    //     if (command.onCooldown) {
    //         console.log('Command is on cooldown');
    //         return true;
    //     } else {

    //         // If command is found, enable command cooldown and reset cmdFound to false
    //         if (cmdFound) {
    //             const filter = { name: command.name },
    //                   setOffCooldown = { onCooldown: false },
    //                   setOnCooldown = { onCooldown: true };

    //             await CommandModel.findOneAndUpdate(filter, setOnCooldown, options)

    //             // command.onCooldown = true;
    //             cmdFound = false;
                
    //             await setTimeout(() => { CommandModel.findOneAndUpdate(filter, setOffCooldown, options) }, command.cooldown);

    //         // If no command is found, then set cmdFound to false and return
    //         } else {
    //             cmdFound = false;
    //             return;
    //         }
    //     }
    // }
}

// Get's the users permission level anytime a command is attempted
const getPermission = (context) => {
    if (context['user-id'] === context['room-id']) {
        return { 
            Broadcaster: 1, 
            Moderators: 1, 
            Everyone: 1 
        };
    }
    else if (context['display-name'] === process.env.CHANNEL_NAME) {
        return { 
            Broadcaster: 1, 
            Moderators: 1, 
            Everyone: 1 
        };
    }
    else if (context.mod === true) { 
        return { 
            Broadcaster: 0, 
            Moderators: 1, 
            Everyone: 1 
        };
    }
    else { 
        return { 
            Broadcaster: 0, 
            Moderators: 0, 
            Everyone: 1 
        }; 
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
    onCommandHandler,
    getCommands
};