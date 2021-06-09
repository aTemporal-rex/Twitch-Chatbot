module.exports.getQuery = (queryType, mediaType) => {
    switch (queryType) {
        case 'pages':
            return `
            query ($page: Int, $isAdult: Boolean, $averageScore_greater: Int) {
                Page (page: $page) {
                    pageInfo {
                        lastPage
                    }
                    media (type: ${mediaType}, isAdult: $isAdult, averageScore_greater: $averageScore_greater) {
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
            case 'greater':
                return `
                query ($page: Int, $isAdult: Boolean, $averageScore_greater: Int) {
                    Page (page: $page) {
                        pageInfo {
                            total
                            lastPage
                        }
                        media (type: ${mediaType}, isAdult: $isAdult, averageScore_greater: $averageScore_greater) {
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
                `;
        default:
            break;
    }
}