const fetch = require('node-fetch'); // Required to use fetch in node.js

const query = `
query ($page: Int, $isAdult: Boolean) {
  Page (page: $page) {
    pageInfo {
      lastPage
    }
    media (type: MANGA, isAdult: $isAdult) {
      siteUrl
      isAdult
      type
      title {
        romaji
        english
      }
    }
  }
}
`;

// This function selects a random manga from all of those listed on anilist
module.exports.getManga = async (mangaPageCount) => {
    const variables = {
        page: Math.floor(Math.random() * mangaPageCount), // Randomizes the page from which to select a manga
        isAdult: false
    };

    const url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

    console.log(`Current Page: ${variables.page}`);

    return fetch(url, options).then(handleResponse).then(handleData).catch(handleError);
}

async function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

// Formats the received data and displays it
async function handleData(data) {
    console.log(`Total Pages: ${data.data.Page.pageInfo.lastPage}`);

    // Getting just the media array
    const medias = data.data.Page.media;

    // Selecting a random manga
    const media = medias[Math.floor(Math.random() * medias.length)].title;

    // Displaying english title if it exists, otherwise displaying romaji title
    media.english ? console.log(`Your next favorite manga is ${media.english}\n`) : console.log(`Your next favorite manga is ${media.romaji}\n`);
    return media.english ? media.english : media.romaji;
}

function handleError(error) {
    console.log('Error, check console');
    console.error(error);
}