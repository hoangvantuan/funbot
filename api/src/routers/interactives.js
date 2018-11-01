const express = require('express')
const axios = require('axios')
const log = require('../log')
const db = require('../db')
const Slack = require('../bot')

const router = express.Router()

router.post('/', async (req, res) => {
    res.status(200).end()
    log.debug(req.body)

    const payload = JSON.parse(req.body.payload)

    if (payload.callback_id === 'auth_google_spreasheet_cancel') {
        axios.post(payload.response_url, {
            response_type: 'ephemeral',
            replace_original: true,
            delete_original: true,
            text: '',
        })
    } else if (payload.callback_id === 'settings') {
        switch (payload.actions[0].name) {
            case 'cancel':
                axios.post(payload.response_url, {
                    response_type: 'ephemeral',
                    replace_original: true,
                    delete_original: true,
                    text: '',
                })
                break
            case 'list':
                try {
                    const userRes = await db.SlackUser.get({
                        user_id: req.body.user_id,
                    })

                    axios.post(payload.response_url, { text: JSON.stringify(userRes.data.data[0].sheets, null, 4) })
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

                    const dialog = {
                        trigger_id: payload.trigger_id,
                        dialog: {
                            callback_id: 'remove-sheety-id',
                            title: 'Remove sheet',
                            submit_label: 'Remove',
                            notify_on_cancel: false,
                            elements: [
                                {
                                    label: 'Sheets ID',
                                    type: 'select',
                                    name: 'sheets-id',
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
                            callback_id: 'add-sheety-id',
                            title: 'Add sheet',
                            submit_label: 'Add',
                            notify_on_cancel: true,
                            elements: [
                                {
                                    type: 'text',
                                    label: 'Sheet ID',
                                    name: 'sheet_id',
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
    }
})

module.exports = router
