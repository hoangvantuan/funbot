const { google } = require('googleapis')
const util = require('../util')
const db = require('../db')
const log = require('../log')

const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI)
class GoogleAuth {
    static getURL(payload) {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: process.env.GOOGLE_SCOPES,
            state: util.Encode(JSON.stringify(payload)),
        })
    }

    static getToken(code) {
        return oauth2Client.getToken(code)
    }

    static async getOauth2Client(googleTokenID) {
        const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI)
        const googleTokenRes = await db.GoogleToken.get({ _id: googleTokenID })

        const tokens = googleTokenRes.data.data[0]

        client.setCredentials(tokens)

        client.on('tokens', newTokens => {
            log.debug('review google tokens ', newTokens)
            const query = {
                query: JSON.stringify({
                    refresh_token: tokens.refresh_token,
                }),
                value: JSON.stringify(newTokens),
            }

            db.GoogleToken.update(query)
        })

        return client
    }
}

module.exports = GoogleAuth
