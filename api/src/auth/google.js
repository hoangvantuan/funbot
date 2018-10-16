const a= require('dotenv').config({ path: '../../config.env' })
const { google } = require('googleapis')
const axios = require('axios')

console.log(a);


googleOAuth([process.env.SPREADSHEET_SCOPE])

function googleOAuth(scopes) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    )

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    })
    console.log(url);
} 

