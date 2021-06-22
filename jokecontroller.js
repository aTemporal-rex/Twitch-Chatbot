const axios = require('axios');

const reJoke = /^!jokes?$/i,
      reDadJoke = /^!dadjokes?$/i;

const config = {
    headers: {
        Accept: 'application/json',
        'User-Agent': 'Twitch.tv Chatbot'
    }
};

async function getJoke () {
    return await axios.get('https://official-joke-api.appspot.com/random_joke');
}

async function getDadJoke () {
    return await axios.get('https://icanhazdadjoke.com/', config);
}

async function tellJoke (target, client, commandName) {
    switch (true) {
        case reJoke.test(commandName):
            const joke = await getJoke();

            // Check if joke was successfully retrieved, then deliver the setup with a punchline following 5 seconds after
            if (joke.status === 200) {
                client.say(target, joke.data.setup);
                setTimeout(() => { client.say(target, `${joke.data.punchline} 4Head`) }, 5000);
                console.log(`${joke.data.setup} ${joke.data.punchline}`);
            }
            break;

        case reDadJoke.test(commandName):
            const dadJoke = await getDadJoke();

            if (dadJoke.data.status === 200) {
                client.say(target, `${dadJoke.data.joke} KEKW`);
                console.log(dadJoke.data.joke);
            }
            break;
    }
}

module.exports = {
    tellJoke
};