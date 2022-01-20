// const axios = require('axios');

const CHANCE = 0.002; // % chance of scare happening
// let number;
      

let scareOnomatopoeias = ['AAAHHHH', 'ARGGHH OWW', 'YEOUUUCH', 'YEOOOOWWW', 'YOWWWWW', 'AAGHHH', 'EEEEEK', 'YIIIIIKES'];

// async function getRandomWords() {
//     number = Math.floor(Math.random() * 3 + 1)
//     const word = await axios.get(`https://random-word-api.herokuapp.com/word?number=${number}&swear=0`);
//     return word.data;
// }

function getOnomatopoeia() {
    return scareOnomatopoeias[Math.floor(Math.random() * scareOnomatopoeias.length)];
}

const initScare = (target, client, context) => {
    // Every 10 minutes there is a 0.1% chance for the bot to sneeze in the given language
    if (Math.random() <= CHANCE) {
        // const words = await getRandomWords();
        //client.say(target, `/me ${getOnomatopoeia()}! Jeez ${context['display-name']} you scared me! jlastAngyxiangling `);
        client.say(target, `/me Hallo${context['display-name']}! GuobaHi`);
    }
}

module.exports = {
    initScare
};