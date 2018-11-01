const express = require('express')
const axios = require('axios')
const log = require('../log')
const db = require('../db')
const Slack = require('../bot')
const util = require('../util')
const worker = require('../worker')

const router = express.Router()

router.post('/', async (req, res) => {
    res.status(200).end()
    log.debug(req.body)

    const payload = JSON.parse(req.body.payload)

    if (payload.actions && payload.actions[0] && payload.actions[0].name === 'cancel') {
        axios.post(payload.response_url, {
            response_type: 'ephemeral',
            replace_original: true,
            delete_original: true,
            text: '',
        })
    } else if (payload.callback_id === 'settings') {
        switch (payload.actions[0].name) {
            case 'list':
                try {
                    const userRes = await db.SlackUser.get({
                        user_id: req.body.user_id,
                    })

                    axios.post(payload.response_url, util.TextWithSettings(JSON.stringify(userRes.data.data[0].sheets, null, 4)))
                } catch (err) {
                    log.debug(err)
                }
                break
            case 'remove':
                try {
                    const userRes = await db.SlackUser.get({
                        user_id: req.body.user_id,
                    })

                    const api = await Slack.BotAPI(payload.team.id)

                    const listsheets = userRes.data.data[0].sheets.map(sheet => {
                        return {
                            label: sheet,
                            value: sheet,
                        }
                    })

                    if (!listsheets || listsheets.length === 0) {
                        axios.post(payload.response_url, util.TextWithSettings('You not have any sheet'))
                        return
                    }

                    const dialog = {
                        trigger_id: payload.trigger_id,
                        dialog: {
                            callback_id: 'remove-sheet-id',
                            title: 'Remove sheet',
                            submit_label: 'Remove',
                            notify_on_cancel: false,
                            elements: [
                                {
                                    label: 'Sheets ID',
                                    type: 'select',
                                    name: 'sheet-id',
                                    options: listsheets,
                                },
                            ],
                        },
                    }

                    api.dialog.open(dialog)
                } catch (err) {
                    log.debug(err)
                }

                break
            case 'add':
                try {
                    const api = await Slack.BotAPI(payload.team.id)

                    const dialog = {
                        trigger_id: payload.trigger_id,
                        dialog: {
                            callback_id: 'add-sheet-id',
                            title: 'Add sheet',
                            submit_label: 'Add',
                            notify_on_cancel: true,
                            elements: [
                                {
                                    type: 'text',
                                    label: 'Sheet ID',
                                    name: 'sheet-id',
                                },
                            ],
                        },
                    }

                    api.dialog.open(dialog)
                } catch (err) {
                    log.debug(err)
                }

                break
            default:
                break
        }
    } else if (payload.callback_id === 'add-sheet-id') {
        const sheetID = payload.submission['sheet-id']

        if (worker.isRunningJob(`^${sheetID}.*`)) {
            axios.post(payload.response_url, util.TextWithRestartJob(`${payload.submission['sheet-id']} is running, you mean restart`))
        } else {
            db.SlackUser.get({ user_id: payload.user.id })
                .then(userRes => {
                    if (userRes.data.data[0].sheets.includes(sheetID)) {
                        axios.post(
                            payload.response_url,
                            util.TextWithRestartJob(`${payload.submission['sheet-id']} was be add but stopped  you mean start`),
                        )
                    } else {
                        const newSheets = [...userRes.data.data[0].sheets, sheetID]

                        const query = {
                            query: JSON.stringify({
                                user_id: payload.user.id,
                            }),
                            value: JSON.stringify({
                                sheets: newSheets,
                            }),
                        }

                        db.SlackUser.update(query)
                            .then(() => {
                                axios.post(payload.response_url, util.TextWithSettings(`Add  ${payload.submission['sheet-id']} success`))

                                worker.startCronUser(userRes.data.data[0], [sheetID])
                            })
                            .catch(err => {
                                log.debug(err)
                                axios.post(payload.response_url, util.TextWithSettings(`Add ${payload.submission['sheet-id']} error`))
                            })
                    }
                })
                .catch(err => {
                    log.debug(err)
                    axios.post(payload.response_url, util.TextWithSettings(`Add ${payload.submission['sheet-id']} error`))
                })
        }
    } else if (payload.callback_id === 'remove-sheet-id') {
        // remove all current job
        worker.clearAllJobMatch(`^${payload.submission['sheet-id']}.*`)
        db.SlackUser.get({ user_id: payload.user.id })
            .then(userRes => {
                const newSheets = userRes.data.data[0].sheets.filter(sheet => {
                    return sheet !== payload.submission['sheet-id']
                })

                const query = {
                    query: JSON.stringify({
                        user_id: payload.user.id,
                    }),
                    value: JSON.stringify({
                        sheets: newSheets,
                    }),
                }

                db.SlackUser.update(query)
                    .then(() => {
                        axios.post(payload.response_url, util.TextWithSettings(`Remove ${payload.submission['sheet-id']} success`))
                    })
                    .catch(err => {
                        log.debug(err)
                        axios.post(payload.response_url, util.TextWithSettings(`Remove ${payload.submission['sheet-id']} error`))
                    })
            })
            .catch(err => {
                log.debug(err)
                axios.post(payload.response_url, util.TextWithSettings(`Remove ${payload.submission['sheet-id']} error`))
            })
    }
})

module.exports = router
