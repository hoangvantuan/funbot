const express = require('express')
const db = require('../db')
const GoogleAuth = require('../auth/google')
const log = require('../log')

const router = express.Router()

const askMessage = (userID, responseURL) => {
    return {
        response_type: 'in_channel',
        text: 'Cho mình quyền truy cập vào google spreasheet của ấy nhé?',
        attachments: [
            {
                callback_id: 'auth_google_spreasheet_cancel',
                color: '#3AA3E3',
                attachment_type: 'default',
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
    log.debug(req.body)

    if (req.body.text === 'authen') {
        // check use token
        try {
            const userRes = await db.SlackUser.get({
                user_id: req.body.user_id,
            })

            if (
                userRes.data.statusText === 'ok'
                && userRes.data.data.length === 1
            ) {
                if (userRes.data.data[0].google_tokens.length > 0) {
                    res.send('token was be registered')
                } else {
                    res.send(
                        askMessage(req.body.user_id, req.body.response_url),
                    )
                }
            } else {
                const teamRes = await db.SlackTeam.get({
                    team_id: req.body.team_id,
                })

                if (
                    teamRes.data.statusText === 'ok'
                    && teamRes.data.data.length === 1
                ) {
                    const team = teamRes.data.data[0]

                    const userRes2 = await db.SlackUser.save({
                        user_id: req.body.user_id,
                        slack_team: team._id,
                    })

                    if (userRes2.data.statusText !== 'ok') {
                        log.debug(userRes2.data)
                        res.send({ text: 'has error' })
                    }

                    res.send(
                        askMessage(req.body.user_id, req.body.response_url),
                    )
                } else {
                    log.debug(teamRes.data)
                    res.send({ text: 'has error' })
                }
            }
        } catch (err) {
            log.debug(err)
            res.send({ text: 'has error' })
        }
    } else if (req.body.text.match('^add.*$')) {
        const args = req.body.text.split(' ')
        if (args[0] === 'add' && args[1]) {
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
                res.send({
                    text: 'Register sheet successfull',
                })
            })
        } else {
            res.send(`not valid command ${req.body.text}`)
        }
    } else if (req.body.text.match('^list$')) {
        const userRes = await db.SlackUser.get({
            user_id: req.body.user_id,
        })

        res.send(JSON.stringify(userRes.data.data[0].sheets), null, 2)
    } else if (req.body.text.match('^rm.*$')) {
        const args = req.body.text.split(' ')

        if (args[0] === 'rm' && args[1]) {
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
                res.send({
                    text: 'delete sheet successfull',
                })
            })
        } else {
            res.send(`not valid command ${req.body.text}`)
        }
    } else {
        res.send(`not valid command ${req.body.text}`)
    }
})

module.exports = router
