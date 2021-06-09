module.exports.getQuery = (queryType, mediaType) => {
    switch (queryType) {
        case 'pages':
            return `
            query ($page: Int, $isAdult: Boolean) {
                Page (page: $page) {
                    pageInfo {
                        lastPage
                    }
                    media (type: ${mediaType}, isAdult: $isAdult) {
                        id
                    }
                }
            }
            `;
        case 'all':
            return `
            query ($page: Int, $isAdult: Boolean) {
                Page (page: $page) {
                    pageInfo {
                    lastPage
                    }
                    media (type: ${mediaType}, isAdult: $isAdult) {
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
        default:
            break;
    }
}