/**
 * Get username from cookie
 * @returns {Object}
 */
function getCookie() {
    const cookie = JSON.parse(decodeURIComponent(document.cookie.split('=')[1]));

    return cookie

}