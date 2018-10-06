const gas = require('./authen-google-api')
const { google } = require('googleapis');
const Cron = require('./cron')

const sheet = "1a8fEdXoXmeUgMwYjvBR4cWcVPdE5gFgD1JnegArIKJ8"

const reminder = 'reminder!A1:Y500'
const ngontinh = 'ngontinh!A1:Y500'

const cron = new Cron()  

module.exports.updateAll = (bot) => {
  gas(update, bot)
}

module.exports.list = () => {
    cron.listJobs()
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function update(auth, bot) {
  cron.bot = bot

  cron.deleteAll()

  // reminder
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: sheet,
    range: reminder,
  }, (err, res) => {
    if (err) {
      console.log("ok", err);
      console.log('The API returned an error: ' + err);
      return
    }
    const rows = res.data.values;

    results = convertToObject(rows)

    cron.addAndStart(results, 'reminder')
  });

  // ngon tinh
  sheets.spreadsheets.values.get({
    spreadsheetId: sheet,
    range: ngontinh,
  }, (err, res) => {
    if (err) {
      console.log("ok", err);
      console.log('The API returned an error: ' + err);
      return
    }
    const rows = res.data.values;

    results = convertToObject(rows)

    cron.addAndStart(results, 'ngontinh')
  });
}

function convertToObject(rows) {
  results = []

  if (rows == null || rows.length == 0) {
    return []
  }

  const headers = rows[0]

  rows.map((values, index) => {
    if (index != 0) {

      results[index - 1] = {}
      headers.map((value, i) => {
        results[index - 1][value] = values[i]
      })
    }
  })

  return results
}