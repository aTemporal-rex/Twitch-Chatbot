module.exports.getQuery = (queryType, mediaType) => {
    if (queryType === 'all') {
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
    }
    // else if (queryType === 'top100') {

    // }
}