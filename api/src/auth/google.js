const { google } = require('googleapis')

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
)
class GoogleAuth {
    static getURL() {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: process.env.GOOGLE_SCOPES,
        })
    }

    static getToken(code) {
        return oauth2Client.getToken(code)
    }

    static refreshToken(refresh_token) {}
}

module.exports = GoogleAuth
