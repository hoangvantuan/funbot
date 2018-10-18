const qs = require('querystring')
const axios = require('axios')

class SlackAuth {
    static getURL() {
        const codeURL = process.env.SLACK_CODE_URL
        const clientID = process.env.SLACK_CLIENT_ID
        const scopes = process.env.SLACK_SCOPES
        const redirectedURI = process.env.SLACK_REDIRECTED_URI

        return `${codeURL}?client_id=${clientID}&scope=${scopes}&redirect_uri=${redirectedURI}`
    }

    static getToken(code) {
        const tokenURL = process.env.SLACK_TOKEN_URL
        const clientID = process.env.SLACK_CLIENT_ID
        const clientSecret = process.env.SLACK_CLIENT_SECRET

        const options = {
            client_id: clientID,
            client_secret: clientSecret,
            code: code
        }

        return axios.post(tokenURL, qs.stringify(options))
    }
}

module.exports = SlackAuth