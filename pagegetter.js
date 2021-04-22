// DOESN'T DO ANYTHING YET********************************
// *******************************************************
const fetch = require("node-fetch");

let pageCount;
const query = `
query ($page: Int) {
    Page (page: $page) {
      pageInfo {
        lastPage
      }
      media {
        id
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

const url = 'https://graphql.anilist.co',
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

fetch(url, options).then(handlePageResponse)
                   .then(getPageCount)
                   .catch(handlePageError);

function handlePageResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

async function getPageCount(data) {
    await (module.exports.pageCount = data.data.Page.pageInfo.lastPage);
}

function handlePageError(error) {
    //console.log('Error, check console');
    console.error(error);
}

//module.exports.pageCount = pageCount;
// exports.pageCount = pageCount;
 
// var app = express();
// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));
// app.listen(4000);
// console.log('Running a GraphQL API server at localhost:4000/graphql');