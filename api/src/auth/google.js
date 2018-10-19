const { google } = require('googleapis')

class GoogleAuth {
    static getURL() {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI,
        )

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: process.env.GOOGLE_SCOPES,
        })
    }
}

module.exports = GoogleAuth
