const axios = require('axios');

module.exports.getJoke = async () => {
    const joke = await axios.get('https://official-joke-api.appspot.com/random_joke');
    return joke;
}