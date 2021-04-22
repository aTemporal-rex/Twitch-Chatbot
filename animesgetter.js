const fetch = require("node-fetch");
const pageCount = 319;

// const PageGetter = require('./pagegetter');
// Jank way to attempt to wait for PageGetter.pageCount to have a value
// PageGetter.pageCount = PageGetter.pageCount || 1603;

const query = `
query ($page: Int) {
  Page (page: $page) {
    pageInfo {
      lastPage
    }
    media (type: ANIME) {
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

fetch(url, options).then(handleResponse)
                   .then(handleData)
                   .catch(handleError);

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

// Formats the received data and displays it
function handleData(data, typeRequested) {
    // Filtering out adult content
    const medias = data.data.Page.media.filter(media => media.isAdult === false);

    // Selecting a random anime
    const media = medias[Math.floor(Math.random() * medias.length)].title;

    // Displaying english title if it exists, otherwise displaying romaji title
    media.english ? console.log(`Your next favorite anime is ${media.english}`) : console.log(`Your next favorite anime is ${media.romaji}`);
}

function handleError(error) {
    console.error(error);
}
 
// var app = express();
// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));
// app.listen(4000);
// console.log('Running a GraphQL API server at localhost:4000/graphql');