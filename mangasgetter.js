const fetch = require("node-fetch");
const pageCount = 1285;

const query = `
query ($page: Int) {
  Page (page: $page) {
    pageInfo {
      lastPage
    }
    media (type: MANGA) {
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

module.exports.getManga = async () => {
    const variables = {
        page: Math.floor(Math.random() * pageCount)
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

    // Selecting a random manga
    const media = medias[Math.floor(Math.random() * medias.length)].title;
    // const media = medias[Math.floor(Math.random() * medias.length)];
    // const title = media.title;

    // Displaying english title if it exists, otherwise displaying romaji title
    media.english ? console.log(`Your next favorite manga is ${media.english}\n`) : console.log(`Your next favorite manga is ${media.romaji}\n`);
    // title.english ? console.log(`Your next favorite manga is ${title.english}\n`) : console.log(`Your next favorite manga is ${title.romaji}\n`);
    return media.english ? media.english : media.romaji;
    // return media;
}

function handleError(error) {
    console.error(error);
}