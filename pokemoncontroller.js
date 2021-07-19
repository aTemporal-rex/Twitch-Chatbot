const fetch = require('node-fetch'); // Required to use fetch in node.js
const { getQuery } = require('./querygetter');

const rareChance = 0.01, appearanceInterval = 600000;
let chosenPokemon;

async function startPokemon(client, target, done) {
    pokemons = await getPokemon('pokemon1');
    client.say(target, `Wild pokemon have invaded the stream! PokemonTrainer When a pokemon appears, type !catch [name] to catch it.`)
    setInterval(() => {
        chosenPokemon = generatePokemon(pokemons);
        client.say(target, `Wild ${chosenPokemon} appeared!`);
        console.log(`Wild ${chosenPokemon} appeared!`);
        done();
    }, appearanceInterval);
}

function generatePokemon (pokemons) {
    if (Math.random() <= rareChance) {
        const filterPokemon = pokemons.data.gen1_species.filter(pokemon => pokemon.is_legendary === true || pokemon.is_mythical === true);
        const random = Math.floor(Math.random() * filterPokemon.length);

        // Choosing pokemon from filtered list, then uppercasing the name
        return filterPokemon[random].name.toUpperCase();
    } else {
        const filterPokemon = pokemons.data.gen1_species.filter(pokemon => pokemon.is_legendary === false);
        const random = Math.floor(Math.random() * filterPokemon.length);

        // Choosing pokemon from filtered list, then uppercasing the name
        return filterPokemon[random].name.toUpperCase();
    }
}

function getChosenPokemon() {
    return chosenPokemon;
}

async function getPokemon (queryType) {
    const query = getQuery(queryType);

    const url = 'https://beta.pokeapi.co/graphql/v1beta',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        };

    return fetch(url, options).then(handleResponse).then(handleData).catch(handleError);
}

async function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

// Formats the received data and displays it
async function handleData(data) {
    return data;
}

async function handleError(error) {
    console.log('Error, check console');
    console.error(error);
}

module.exports = {
    getPokemon,
    generatePokemon,
    getChosenPokemon,
    startPokemon
};