const { google } = require('googleapis')
const util = require('../util')

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
)
class GoogleAuth {
    static getURL(userID, responseURL) {
        const state = {
            userID,
            responseURL,
        }

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: process.env.GOOGLE_SCOPES,
            state: util.Encode(JSON.stringify(state)),
        })
    }

    static getToken(code) {
        return oauth2Client.getToken(code)
    }
}

module.exports = GoogleAuth
