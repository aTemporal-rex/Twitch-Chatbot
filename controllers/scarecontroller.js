const axios = require('axios');

const CHANCE = 0.005; // % chance of scare happening
let number;
      

let scareOnomatopoeias = ['AAAHHHH', 'ARGGHH OWW', 'YEOUUUCH', 'YEOOOOWWW', 'YOWWWWW', 'AAGHHH', 'EEEEEK', 'YIIIIIKES'];

async function getRandomWords() {
    number = Math.floor(Math.random() * 3 + 1)
    const word = await axios.get(`https://random-word-api.herokuapp.com/word?number=${number}&swear=0`);
    return word.data;
}

function getOnomatopoeia() {
    return scareOnomatopoeias[Math.floor(Math.random() * scareOnomatopoeias.length)];
}

const initScare = async (target, client, context) => {
    // Every 10 minutes there is a 0.1% chance for the bot to sneeze in the given language
    if (Math.random() <= CHANCE) {
        const words = await getRandomWords();
        switch (number) {
            case 1:
                client.say(target, `/me ${getOnomatopoeia()}! ${words[0]}! Jeez ${context['display-name']} you scared me! jlastAngyxiangling `);
                break;
            case 2:
                client.say(target, `/me ${getOnomatopoeia()}! ${words[0]} ${words[1]}! Jeez ${context['display-name']} you scared me! jlastAngyxiangling `);
                break;
            case 3:
                client.say(target, `/me ${getOnomatopoeia()}! ${words[0]} ${words[1]} ${words[2]}! Jeez ${context['display-name']} you scared me! jlastAngyxiangling `);
                break;
        }
    }
}

module.exports = {
    initScare
};