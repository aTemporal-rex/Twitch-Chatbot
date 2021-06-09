const fetch = require('node-fetch'); // Required to use fetch in node.js
const { getQuery } = require('./querygetter');

module.exports.getPageCount = async (mediaType) => {
    const query = getQuery('pages', mediaType)

    const variables = {
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

    return fetch(url, options).then(handleResponse).then(handleData).catch(handleError);
}

async function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

async function handleData(data) {
    return data.data.Page.pageInfo.lastPage;
}

async function handleError(error) {
    console.log('Error, check console');
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