const CronJonManager = require('cron-job-manager')
const { google } = require('googleapis')
const db = require('../db')
const log = require('../log')
const GoogkeAuth = require('../auth/google')

const jobManager = new CronJonManager()

class Worker {
    async start() {
        // clear all current job
        log.debug('delete all job before start')
        cleaAllJob()

        const teamsRes = await db.SlackTeam.get({})

        teamsRes.data.data.forEach(async team => {
            log.debug('create worker for team', team)
            const usersRes = await db.SlackUser.get({ slack_team: team._id })

            usersRes.data.data.forEach(user => {
                log.debug('create worker for user', user)
                try {
                    startCronUser(team, user)
                } catch (err) {
                    log.debug(err)
                }
            })
        })
    }
}

function cleaAllJob() {
    for (const key in jobManager.jobs) {
        log.debug('delete job ', key)
        jobManager.deleteJob(key)
    }
}

async function startCronUser(team, user) {
    if (user.google_tokens[0]) {
        const googleTokenID = user.google_tokens[0]

        user.sheets.forEach(sheet => {
            log.debug('staring cron sheet ', sheet)
            startCronSheet(team, googleTokenID, sheet)
        })
    }
}

async function startCronSheet(team, googleTokenID, sheetID) {
    const auth = await GoogkeAuth.getOauth2Client(googleTokenID)

    const sheets = google.sheets({ version: 'v4', auth })

    sheets.spreadsheets.get(
        {
            spreadsheetId: sheetID,
        },
        (err, res) => {
            const sheetArray = res.data.sheets.map(value => {
                return value.properties.title
            })

            sheetArray.forEach(val => {
                createJobFromSheet(sheets, val)
            })
        },
    )
}

function createJobFromSheet(sheets, val) {
    log.debug('starting cron ', val)
}

const worker = new Worker()

module.exports = worker
