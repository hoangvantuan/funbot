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
        try {
            const teamsRes = await db.SlackTeam.get({})

            teamsRes.data.data.forEach(async team => {
                log.debug('create worker for team', team)
                const usersRes = await db.SlackUser.get({
                    slack_team: team._id,
                })

                usersRes.data.data.forEach(user => {
                    log.debug('create worker for user', user)
                    try {
                        startCronUser(team, user)
                    } catch (err) {
                        log.debug(err)
                    }
                })
            })
        } catch (err) {
            log.debug(err)
        }
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

        const auth = await GoogkeAuth.getOauth2Client(googleTokenID)

        user.sheets.forEach(sheet => {
            log.debug('staring cron sheet ', sheet)
            startCronSheet(team, auth, sheet)
        })
    }
}

async function startCronSheet(team, auth, sheetID) {
    try {
        const sheets = google.sheets({ version: 'v4', auth })

        sheets.spreadsheets.get(
            {
                spreadsheetId: sheetID,
            },
            (err, res) => {
                const sheetArray = res.data.sheets.map(value => {
                    return value.properties.title
                })

                sheetArray.forEach(sheet => {
                    createJobFromSheet(sheets, sheetID, sheet)
                })
            },
        )
    } catch (err) {
        log.debug(err)
    }
}

function createJobFromSheet(sheets, sheetID, sheet) {
    // get configure of spreadsheet
    sheets.spreadsheets.values.get(
        {
            spreadsheetId: sheetID,
            range: `${sheet}!A1:AA2`,
        },
        (err, res) => {
            if (err) {
                log.debug(err)
                return
            }

            const rows = convertToObject(res.data.values)

            if (rows[0].type === 'random') {
                log.debug('random')
            }

            if (rows[0].type === 'normal') {
                log.debug('normal')
            }
        },
    )
}

function createJobForRandomType(sheets, sheetID, sheet) {
    // jobManager.
}

function createJobForNormalType(sheets, sheetID, sheet) {}

function convertToObject(rows) {
    const results = []

    if (rows == null || rows.length === 0) {
        return []
    }

    const headers = rows[0]

    rows.map((values, index) => {
        if (index !== 0) {
            results[index - 1] = {}
            headers.map((value, i) => {
                results[index - 1][value] = values[i]
            })
        }
    })

    return results
}

const worker = new Worker()

module.exports = worker
