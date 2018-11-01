const express = require('express')
const axios = require('axios')
const db = require('../db')
const GoogleAuth = require('../auth/google')
const log = require('../log')
const util = require('../util')

const router = express.Router()

const askMessage = payload => {
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
                        url: GoogleAuth.getURL(payload),
                        style: 'primary',
                    },
                    {
                        name: 'cancel',
                        text: 'Tắt đi.',
                        type: 'button',
                        value: 'cancel',
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
                axios.post(req.body.response_url, askMessage(req.body))
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

                    axios.post(req.body.response_url, askMessage(req.body))
                } else {
                    log.debug(teamRes.data)
                }
            }
        } catch (err) {
            log.debug(err)
        }
    } else if (req.body.text.match('^help$')) {
        axios.post(req.body.response_url, util.TextWithSettings('Chào bạn, mình để mình là ứng dụng nhắc nhở, mình có thể giúp gì cho bạn?'))
    } else {
        axios.post(req.body.response_url, { text: `Not valid commands ${req.body.text}` })
    }
})

module.exports = router
