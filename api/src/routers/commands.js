const express = require('express')
const db = require('../db')
const GoogleAuth = require('../auth/google')
const log = require('../log')

const router = express.Router()

const askMessage = userID => {
    return {
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
                        url: GoogleAuth.getURL(userID),
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

    // check use token
    try {
        const userRes = await db.SlackUser.get({ user_id: req.body.user_id })

        if (
            userRes.data.statusText === 'ok'
            && userRes.data.data.length === 1
        ) {
            if (userRes.data.data[0].google_tokens.length > 0) {
                res.send('token was be registered')
            } else {
                res.send(askMessage(req.body.user_id))
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

                res.send(askMessage(req.body.user_id))
            } else {
                log.debug(teamRes.data)
                res.send({ text: 'has error' })
            }
        }
    } catch (err) {
        log.debug(err)
        res.send({ text: 'has error' })
    }
})

module.exports = router
