const TIME_BEFORE_ANGY = 20000,
      CHANCE = 0.02; // % chance of sneeze happening

let timePrevSneeze = 0,
    sneezeData;


const sneezeObject = {
    English: {
        response: [
            'BLESS YOU',
            'GESUNDHEIT'
        ],
        reply: [
            'Thank you',
            'And you'
        ],
        regex: /bless you|gesundheit/i
        
    },
    French: {
        response: 'VOS SOUHAITS',
        reply: 'Merci',
        regex: /vos souhaits/i
    },
    German: {
        response: 'GESUNDHEIT',
        reply: 'Danke',
        regex: /gesundheit/i
    },
    Spanish: {
        response: [
            'SALUD',
            'DIOS TE BENDIGA'
        ],
        reply: 'Gracias',
        regex: /salud|dios te bendiga/i
        
    },
    Swedish: {
        response: 'PROSIT',
        reply: 'Tack',
        regex: /prosit/i
    },
    Italian: {
        response: 'SALUTE',
        reply: 'Grazie',
        regex: /salute/i
    }
};    

const initSneeze = (target, client) => {
    // Every 10 minutes there is a 25% chance for the bot to sneeze in the given language
    if (Math.random() <= CHANCE) {
        sneezeData = getSneezeData();

        switch (sneezeData.language) {
            case 'English':
                client.say(target, `/me *aaAACHOOOO*`);
                return true;
            case 'French':
                client.say(target, `/me *aaAATCHUMM*`);
                return true;
            case 'German':
                client.say(target, `/me *haAATSCHII*`);
                return true;
            case 'Spanish':
                client.say(target, `/me *aaAACHÚÚÚÚ*`);
                return true;
            case 'Swedish':
                client.say(target, `/me *aaAATJOOOO*`);
                return true;
            case 'Italian':
                client.say(target, `/me *aaAACCIÙÙÙ*`);
                return true;
        }
    }
}

function getSneezeData () {
    const languages = Object.keys(sneezeObject); // Getting an array of all the languages
    const language = languages[Math.floor(Math.random() * languages.length)]; // Selecting a random language

    // Getting an object of responses and replies for the selected language
    const sneezeData = sneezeObject[language]; 

    // Assigning the respones, replies, and regex to their respective variables
    const replies = sneezeData.reply;
    const responses = sneezeData.response;
    const regex = sneezeData.regex;

    // If more than 1 reply is available it will pick a random one
    const reply = Array.isArray(replies) ? replies[Math.floor(Math.random() * replies.length)] : replies;

    // Returns an array containing the responses, reply, and language
    return {'response': responses, 'reply': reply, 'language': language, 'regex': regex};
};

function onSneezeHandler (target, msg, client) {
    if (timePrevSneeze === 0) { timePrevSneeze = Date.now(); }

    // Check to see if someone replied to bunny senpai's sneeze
    if (sneezeData.regex.test(msg.trim())) {

        client.say(target, `${sneezeData.reply}`);
        timePrevSneeze = 0;
        return false;

    } else if (timePrevSneeze <= (Date.now() - TIME_BEFORE_ANGY)) {

        // Check if response is array and pick a random response if it is
        const response = Array.isArray(sneezeData.response) ? sneezeData.response[Math.floor(Math.random() * sneezeData.response.length)] : sneezeData.response;
        client.say(target, `I SNEEZED MAYBE ${TIME_BEFORE_ANGY/1000} SECONDS AGO AND NO ONE EVEN SAID ${response.toUpperCase()}!! BunnyRage`);
        timePrevSneeze = 0;
        return false;

    }

    return true;
}

module.exports = {
    onSneezeHandler,
    initSneeze
};