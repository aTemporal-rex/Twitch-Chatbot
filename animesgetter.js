const fetch = require('node-fetch'); // Required to use fetch in node.js

const queryAll = `
query ($page: Int, $isAdult: Boolean) {
  Page (page: $page) {
    pageInfo {
      lastPage
    }
    media (type: ANIME, isAdult: $isAdult) {
      siteUrl
      isAdult
      title {
        romaji
        english
      }
    }
  }
}
`;

const queryTop100 = `
query ($page: Int) {
  Page (page: $page) {
    pageInfo {
      total
      lastPage
    }
    media (type: ANIME) {
      siteUrl
      isAdult
      averageScore
      title {
        romaji
        english
      }
    }
  }
}
`

// This function selects a random anime from all of those listed on anilist
module.exports.getAnime = async (animePageCount) => {
    const variables = {
        page: Math.floor(Math.random() * animePageCount), // Randomizes the page from which to select an anime
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
                query: queryAll,
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

    // Selecting a random anime
    const media = medias[Math.floor(Math.random() * medias.length)].title;

    // Displaying english title if it exists, otherwise displaying romaji title
    media.english ? console.log(`Your next favorite anime is ${media.english}\n`) : console.log(`Your next favorite anime is ${media.romaji}\n`);
    return media.english ? media.english : media.romaji;

}

async function handleError(error) {
    console.log('Error, check console');
    console.error(error);
}