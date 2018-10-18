const { google } = require('googleapis')
const axios = require('axios')

class GoogleAuth{
    static getURL() {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        )
    
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        })
    }
}

module.exports = GoogleAuth
