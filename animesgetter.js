const fetch = require("node-fetch"); // Required to use fetch in node.js

const query = `
query ($page: Int) {
  Page (page: $page) {
    pageInfo {
      currentPage
      lastPage
    }
    media (type: ANIME) {
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

// This function selects a random anime from all of those listed on anilist
module.exports.getAnime = async (animePageCount) => {
    const variables = {
        page: Math.floor(Math.random() * animePageCount) // Randomizes the page from which to select an anime
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

    // Filtering out adult content
    const medias = data.data.Page.media.filter(media => media.isAdult === false);

    // Selecting a random anime
    const media = medias[Math.floor(Math.random() * medias.length)].title;
    // const media = medias[Math.floor(Math.random() * medias.length)];
    // const title = media.title;

    // Displaying english title if it exists, otherwise displaying romaji title
    media.english ? console.log(`Your next favorite anime is ${media.english}\n`) : console.log(`Your next favorite anime is ${media.romaji}\n`);
    // title.english ? console.log(`Your next favorite anime is ${title.english}\n`) : console.log(`Your next favorite anime is ${title.romaji}\n`);
    return media.english ? media.english : media.romaji;
    // return media;
}

async function handleError(error) {
    console.log('Error, check console');
    console.error(error);
}