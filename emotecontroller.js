const axios = require('axios');
require('dotenv').config();

const emoticonChecker = [];
const NUM_MSG_CHECK = 5;
let msgCounter = 0;

const getFFZData = async (emoticons) => {
    const data = await axios.get(`https://api.frankerfacez.com/v1/room/${process.env.TWITCH_NAME}`);
    const id = data.data.room.set; // Gets the id used for the emote set

    data.data.sets[id].emoticons.forEach(emoticon => {
        emoticons.push(emoticon.name);
    });
}

const getBTTVData = async (emoticons) => {
    const data = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${process.env.TWITCH_ID}`);
    
    data.data.channelEmotes.forEach(emoticon => {
        emoticons.push(emoticon.code)
    });

    data.data.sharedEmotes.forEach(emoticon => {
        emoticons.push(emoticon.code);
    });
}


async function initEmotes (emoticons) {
    await getFFZData(emoticons);
    await getBTTVData(emoticons);
}

function onEmoteHandler (target, msg, client, emoticons) {
    if (msgCounter < NUM_MSG_CHECK) {
        const emoteCount = {};

        // Check to see if message included an emote, then get the emote index from emoticons array
        const index = emoticons.findIndex(emoticon => msg.includes(emoticon));

        // Array that checks the last 5 messages
        emoticonChecker.push(emoticons[index]);

        // Add each emote to the counts object and their number of occurrences
        emoticonChecker.forEach(emoticon => { emoteCount[emoticon] = (emoteCount[emoticon] || 0) + 1; });

        // Checking if an emote reaches over 3 occurrences in the past NUM_MSG_TO_CHECK msgs
        const emoteHype = Object.keys(emoteCount).find(emoticon => emoteCount[emoticon] >= 3 && emoticon != 'undefined');

        ++msgCounter;
        if (emoteHype) {
            client.say(target, emoteHype);
            clearEmoteChecker();
        } else if (emoticonChecker.length === 5) {
            clearEmoteChecker();
        }

    } else {
        clearEmoteChecker();
    }
}

function clearEmoteChecker () {
    emoticonChecker.length = 0;
    msgCounter = 0;
}

module.exports = {
    initEmotes,
    onEmoteHandler
};