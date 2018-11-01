const express = require('express')
const axios = require('axios')
const db = require('../db')
const GoogleAuth = require('../auth/google')
const log = require('../log')

const router = express.Router()

const askMessage = (userID, responseURL) => {
    return {
        text: 'Cho mình quyền truy cập vào google spreasheet của ấy nhé?',
        attachments: [
            {
                callback_id: 'auth_google_spreasheet_cancel',
                color: '#3AA3E3',
                attachment_type: 'default',
                fallback: 'authen google spreasheet',
                actions: [
                    {
                        name: 'GoogleAuthOk',
                        text: 'Ok ấy',
                        type: 'button',
                        url: GoogleAuth.getURL(userID, responseURL),
                        style: 'primary',
                    },
                    {
                        name: 'GoogleAuthCancel',
                        text: 'Tắt đi.',
                        type: 'button',
                        value: 'GoogkeAuthCancel',
                        style: 'danger',
                    },
                ],
            },
        ],
    }
}

router.post('/', async (req, res) => {
    res.status(200).end()
    log.debug(req.body)

    if (req.body.text === 'authen') {
        // check use token
        try {
            const userRes = await db.SlackUser.get({
                user_id: req.body.user_id,
            })

            if (userRes.data.statusText === 'ok' && userRes.data.data.length === 1) {
                // replace old token if had before
                axios.post(req.body.response_url, askMessage(req.body.user_id, req.body.response_url))
            } else {
                const teamRes = await db.SlackTeam.get({
                    team_id: req.body.team_id,
                })

                if (teamRes.data.statusText === 'ok' && teamRes.data.data.length === 1) {
                    const team = teamRes.data.data[0]

                    const userRes2 = await db.SlackUser.save({
                        user_id: req.body.user_id,
                        slack_team: team._id,
                    })

                    if (userRes2.data.statusText !== 'ok') {
                        log.debug(userRes2.data)
                    }

                    axios.post(req.body.response_url, askMessage(req.body.user_id, req.body.response_url))
                } else {
                    log.debug(teamRes.data)
                }
            }
        } catch (err) {
            log.debug(err)
        }
    } else if (req.body.text.match('^add.*$')) {
        const args = req.body.text.split(' ')
        if (args[0] === 'add' && args[1]) {
            try {
                // get current sheet
                const userRes = await db.SlackUser.get({
                    user_id: req.body.user_id,
                })

                const query = {
                    query: JSON.stringify({
                        user_id: req.body.user_id,
                    }),
                    value: JSON.stringify({
                        sheets: [...userRes.data.data[0].sheets, args[1]],
                    }),
                }
                db.SlackUser.update(query).then(() => {
                    axios.post(req.body.response_url, { text: `Register ${args[1]} sheet successfull` })
                })
            } catch (err) {
                log.debug(err)
            }
        } else {
            axios.post(req.body.response_url, { text: `Not valid commands ${req.body.text}` })
        }
    } else if (req.body.text.match('^list$')) {
        try {
            const userRes = await db.SlackUser.get({
                user_id: req.body.user_id,
            })

            axios.post(req.body.response_url, { text: JSON.stringify(userRes.data.data[0].sheets, null, 4) })
        } catch (err) {
            log.debug(err)
        }
    } else if (req.body.text.match('^rm.*$')) {
        const args = req.body.text.split(' ')

        if (args[0] === 'rm' && args[1]) {
            try {
                const userRes = await db.SlackUser.get({
                    user_id: req.body.user_id,
                })

                const newSheets = userRes.data.data[0].sheets.filter(sheet => {
                    return sheet !== args[1]
                })

                const query = {
                    query: JSON.stringify({
                        user_id: req.body.user_id,
                    }),
                    value: JSON.stringify({
                        sheets: newSheets,
                    }),
                }
                db.SlackUser.update(query).then(() => {
                    axios.post(req.body.response_url, { text: `Delete  ${args[1]} sheet successfull` })
                })
            } catch (err) {
                log.debug('has error')
            }
        } else {
            axios.post(req.body.response_url, { text: `Not valid commands ${req.body.text}` })
        }
    } else {
        axios.post(req.body.response_url, { text: `Not valid commands ${req.body.text}` })
    }
})

module.exports = router
