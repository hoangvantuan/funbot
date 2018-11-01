const CronJonManager = require('cron-job-manager')
const { google } = require('googleapis')
const util = require('../util')
const db = require('../db')
const log = require('../log')
const GoogkeAuth = require('../auth/google')
const Slack = require('../bot')

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
    if (user.google_tokens) {
        const googleTokenID = user.google_tokens

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
                    createJobFromSheet(team, sheets, sheetID, sheet)
                })
            },
        )
    } catch (err) {
        log.debug(err)
    }
}

function createJobFromSheet(team, sheets, sheetID, sheet) {
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

            const headers = rows[0]

            if (headers.type === 'random') {
                // validate
                if (!headers.time || !headers.channel) {
                    return
                }

                if (!headers.username) {
                    headers.username = 'reminder'
                }

                createJobForRandomType(team, sheets, sheetID, sheet, headers)
            }

            if (headers.type === 'normal') {
                // validate
                if (!headers.channel) {
                    return
                }

                if (!headers.username) {
                    headers.username = 'reminder'
                }

                createJobForNormalType(team, sheets, sheetID, sheet, headers)
            }
        },
    )
}

function createJobForRandomType(team, sheets, sheetID, sheet, headers) {
    const key = `${sheetID}-${sheet}`
    jobManager.add(key, headers.time, () => {
        sheets.spreadsheets.values.get(
            {
                spreadsheetId: sheetID,
                range: `${sheet}!A3:AA100000`,
            },
            async (err, res) => {
                if (err) {
                    log.debug(err)
                    return
                }

                const rows = convertToObject(res.data.values)

                const index = util.RandomInt(rows.length)
                const data = rows[index]

                if (data) {
                    if (!data.text) {
                        return
                    }

                    const api = await Slack.BotAPI(team.team_id)

                    api.chat.postMessage({
                        channel: headers.channel,
                        text: data.text,
                        attachments: [
                            {
                                fields: [],
                                image_url: data.image_url,
                                thumb_url: data.thumb_url,
                            },
                        ],
                        username: headers.username,
                        icon_url: headers.icon_url,
                    })
                }
            },
        )
    })

    if (jobManager.exists(key)) {
        jobManager.start(key)
    }
}

function createJobForNormalType(team, sheets, sheetID, sheet, headers) {
    sheets.spreadsheets.values.get(
        {
            spreadsheetId: sheetID,
            range: `${sheet}!A3:AA100000`,
        },
        async (err, res) => {
            if (err) {
                log.debug(err)
                return
            }

            const rows = convertToObject(res.data.values)

            const api = await Slack.BotAPI(team.team_id)

            rows.forEach(row => {
                // validate
                if (!row.time || !row.text) {
                    return
                }

                const key = `${sheetID}-${sheet}-${util.RandomString(10)}`
                jobManager.add(key, row.time, () => {
                    api.chat.postMessage({
                        channel: headers.channel,
                        text: row.text,
                        attachments: [
                            {
                                fields: [],
                                image_url: row.image_url,
                                thumb_url: row.thumb_url,
                            },
                        ],
                        username: headers.username,
                        icon_url: headers.icon_url,
                    })
                })

                if (jobManager.exists(key)) {
                    jobManager.start(key)
                }
            })
        },
    )
}

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
