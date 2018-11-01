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
        this.cleaAllJob()
        try {
            const teamsRes = await db.SlackTeam.get({})

            teamsRes.data.data.forEach(team => {
                this.startCronTeam(team)
            })
        } catch (err) {
            log.debug(err)
        }
    }

    cleaAllJob() {
        for (const key in jobManager.jobs) {
            log.debug('delete job ', key)
            jobManager.deleteJob(key)
        }
    }

    clearAllJobMatch(regex) {
        for (const key in jobManager.jobs) {
            if (key.match(regex)) {
                log.debug('delete job ', key)
                jobManager.deleteJob(key)
            }
        }
    }

    isRunningJob(regex) {
        for (const key in jobManager.jobs) {
            if (key.match(regex)) {
                return true
            }
        }

        return false
    }

    async startCronTeam(team) {
        log.debug('create worker for team', team)
        const usersRes = await db.SlackUser.get({
            slack_team: team._id,
        })

        usersRes.data.data.forEach(user => {
            log.debug('create worker for user', user)
            try {
                this.startCronUser(user)
            } catch (err) {
                log.debug(err)
            }
        })
    }

    async startCronUser(user, sheets) {
        if (user.google_tokens) {
            const googleTokenID = user.google_tokens

            const auth = await GoogkeAuth.getOauth2Client(googleTokenID)

            const team = await db.SlackTeam.get({ _id: user.team_id })

            const cronsheets = sheets && sheets.length > 0 ? sheets : user.sheets

            cronsheets.forEach(sheet => {
                log.debug('staring cron sheet ', sheet)
                this.startCronSheet(team, sheet, auth)
            })
        }
    }

    async startCronSheet(team, sheetID, auth) {
        try {
            const sheets = google.sheets({ version: 'v4', auth })

            sheets.spreadsheets.get(
                {
                    spreadsheetId: sheetID,
                },
                (err, res) => {
                    if (err) {
                        log.debug(err)
                        return
                    }
                    const sheetArray = res.data.sheets.map(value => {
                        return value.properties.title
                    })

                    sheetArray.forEach(sheet => {
                        log.debug('create job for sheet', sheetID)
                        this.createJobFromSheet(team, sheets, sheetID, sheet)
                    })
                },
            )
        } catch (err) {
            log.debug(err)
        }
    }

    createJobFromSheet(team, sheets, sheetID, sheet) {
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

                    this.createJobForRandomType(team, sheets, sheetID, sheet, headers)
                }

                if (headers.type === 'normal') {
                    // validate
                    if (!headers.channel) {
                        return
                    }

                    if (!headers.username) {
                        headers.username = 'reminder'
                    }

                    this.createJobForNormalType(team, sheets, sheetID, sheet, headers)
                }
            },
        )
    }

    createJobForRandomType(team, sheets, sheetID, sheet, headers) {
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

    createJobForNormalType(team, sheets, sheetID, sheet, headers) {
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
