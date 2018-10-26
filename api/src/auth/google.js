const { google } = require('googleapis')

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
)
class GoogleAuth {
    static getURL(userID) {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: process.env.GOOGLE_SCOPES,
            state: userID,
        })
    }

    static getToken(code) {
        return oauth2Client.getToken(code)
    }
}

module.exports = GoogleAuth
