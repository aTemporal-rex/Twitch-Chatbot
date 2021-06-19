const axios = require('axios');
require('dotenv').config();

const emoticonChecker = [];

const getFFZData = async (emoticons) => {
    const data = await axios.get(`https://api.frankerfacez.com/v1/room/${process.env.TWITCH_NAME}`);
    const id = data.data.room.set;
    // console.log(data.data);
    // const id = data.data
    // console.log(data.data.sets[id].emoticons[0].name);
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

    // console.log(data.data.channelEmotes);
    // console.log(data.data.sharedEmotes);
}


module.exports.initEmotes = async (emoticons) => {
    await getFFZData(emoticons);
    await getBTTVData(emoticons);
}

module.exports.displayEmote = (target, msg, client, emoticons) => {
    let counts = {};
    const index = emoticons.findIndex(emoticon => msg.includes(emoticon));

    emoticonChecker.push(emoticons[index]);

    
    emoticonChecker.forEach(emoticon => { counts[emoticon] = (counts[emoticon] || 0) + 1; });
    const emoteHype = Object.keys(counts).find(emoticon => counts[emoticon] >= 3);
    if (emoteHype != undefined) { client.say(target, emoteHype); }
}

module.exports.clearEmoteChecker = () => {
    emoticonChecker.length = 0;
}