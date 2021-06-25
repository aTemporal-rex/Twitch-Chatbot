const TIME_BEFORE_ANGY = 20000,
      CHANCE = 0.03, // % chance of sneeze happening
      responseGiven = []; // Keeps track of if a response was given for each sneeze

let sneezeData,
    botAngy = false; // Checks if bot got angry


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
    // responseGiven = false;
    // Every 10 minutes there is a 3% chance for the bot to sneeze in the given language
    if (Math.random() <= CHANCE) {
        sneezeData = getSneezeData();

        switch (sneezeData.language) {
            case 'English':
                client.say(target, `/me *aaAACHOOOO*`);
                break;
            case 'French':
                client.say(target, `/me *aaAATCHUMM*`);
                break;
            case 'German':
                client.say(target, `/me *haAATSCHII*`);
                break;
            case 'Spanish':
                client.say(target, `/me *aaAACHÚÚÚÚ*`);
                break;
            case 'Swedish':
                client.say(target, `/me *aaAATJOOOO*`);
                break;
            case 'Italian':
                client.say(target, `/me *aaAACCIÙÙÙ*`);
                break;
        }

        setTimeout(function () {
            if (responseGiven.shift() === undefined) {
                console.log('test');
                // Check if response is array and pick a random response if it is
                const response = Array.isArray(sneezeData.response) ? sneezeData.response[Math.floor(Math.random() * sneezeData.response.length)] : sneezeData.response;
                client.say(target, `I SNEEZED MAYBE ${TIME_BEFORE_ANGY/1000} SECONDS AGO AND NO ONE EVEN SAID ${response}!! BunnyRage`);
                botAngy = true;
            }
        }, TIME_BEFORE_ANGY);

        return true;
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
    console.log(sneezeData);

    // Returns an array containing the responses, reply, and language
    return {'response': responses, 'reply': reply, 'language': language, 'regex': regex};
};

function onSneezeHandler (target, msg, client) {
    // If bot got angry, sets botAngy to false and returns false to sneeze to handle result of this sneeze
    if (botAngy === true) { return setSneezeDefaults(); }

    // If appropriate response is given, pushes true to responseGiven array to handle the result of this sneeze
    // Returns false to say that sneeze has been resolved
    if (sneezeData.regex.test(msg.trim())) {
        client.say(target, `${sneezeData.reply}`);
        responseGiven.push(true); 
        return false;
    } else {
        return true; 
    }
}

function setSneezeDefaults () {
    botAngy = false;
    return false;
}

module.exports = {
    onSneezeHandler,
    initSneeze
};