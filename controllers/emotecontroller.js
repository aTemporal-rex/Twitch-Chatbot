const axios = require('axios');
require('dotenv').config();

const emoticonChecker = [];
const NUM_MSG_CHECK = 8;
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

// ** Not currently being used
const getGlobalEmotes = async () => {
    const data = await axios.get(`https://api.twitch.tv/helix/chat/emotes/global`);
    console.log(data);
}

// ** Not currently being used
const getChannelEmotes = async () => {
    const data = await axios.get(`https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${process.env.TWITCH_ID}`);
    console.log(data);

}

async function initEmotes (emoticons) {
    await getFFZData(emoticons);
    await getBTTVData(emoticons);
    // await getChannelEmotes();
}

function onEmoteHandler (target, msg, client, emoticons) {
    if (msgCounter < NUM_MSG_CHECK) {
        const emoteCount = {};

        // Check to see if message included an emote, then get the emote from emoticons array
        const emoticon = msg.match(emoticons);

        // Array that checks the last 5 messages
        emoticonChecker.push(emoticon);

        // Add each emote to the counts object and their number of occurrences
        emoticonChecker.forEach(emoticon => { emoteCount[emoticon] = (emoteCount[emoticon] || 0) + 1; });

        // Checking if an emote reaches over 3 occurrences in the past NUM_MSG_CHECK msgs
        const emoteHype = Object.keys(emoteCount).find(emoticon => emoteCount[emoticon] >= 3 && emoticon != 'undefined');

        ++msgCounter; // Counter for number of messages being checked

        console.log(emoteHype);
        // If emoteHype is not undefined, display the emote(s)
        if (emoteHype && emoteHype != 'null') {
            client.say(target, emoteHype.replace(/,/g, ' '));
            clearEmoteChecker();
        } else if (emoticonChecker.length === NUM_MSG_CHECK) {
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