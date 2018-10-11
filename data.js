const gas = require('./authen-google-api')
const { google } = require('googleapis');
const Cron = require('./cron')

const sheet = "1a8fEdXoXmeUgMwYjvBR4cWcVPdE5gFgD1JnegArIKJ8"

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

  sheets.spreadsheets.get({
    spreadsheetId: sheet,
  }, (err, res) => {
   const  sheetArray = res.data.sheets.map(value => {
      return value.properties.title
    })

    sheetArray.forEach(val => {
      console.log(val);
      
      createJob(sheets, val)
    })
  })
}

function createJob(sheets, sheetName) {
  sheets.spreadsheets.values.get({
    spreadsheetId: sheet,
    range: sheetName + "!A1:Y10000",
  }, (err, res) => {
    if (err) {
      console.log("ok", err);
      console.log('The API returned an error: ' + err);
      return
    }
    
    const rows = res.data.values;

    results = convertToObject(rows)
    
    if(sheetName.includes("reminder")) {
      cron.addAndStart(results, 'reminder')
    }

    if(sheetName.includes("random")) {
      cron.addAndStart(results, 'random')
    }
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