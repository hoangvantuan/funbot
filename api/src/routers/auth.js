const express = require('express')
const SlackAuth = require('../auth/slack')
const db = require('../db')
const log = require('../log')
const util = require('../util')

const router = express.Router()

router.get('/google/redirected', (req, res) => {
    log.debug(req.params)
    log.debug(req.body)

    res.send('ok')
})

router.get('/slack/url', (req, res) => {
    res.redirect(SlackAuth.getURL())
})

router.get('/slack/redirected', async (req, res) => {
    const { query } = req

    if (!query.code) {
        res.send('code is invalid')
    }

    try {
        const tokens = await SlackAuth.getToken(query.code)

        if (tokens && tokens.data) {
            const team = await db.SlackTeam.get({
                team_id: tokens.data.team_id,
            })

            // encode access token
            tokens.data.access_token = util.Encode(tokens.data.access_token)
            tokens.data.bot.bot_access_token = util.Encode(
                tokens.data.bot.bot_access_token,
            )

            if (team.data && team.data.data.length > 0) {
                await db.SlackTeam.update({
                    query: `{"team_id": "${tokens.data.team_id}"}`,
                    value: JSON.stringify(tokens.data),
                })

                res.redirect('https://slack.com/app_redirect?app=ADHDD3T9P')
            } else {
                await db.SlackTeam.save(tokens.data)
                res.redirect('https://slack.com/app_redirect?app=ADHDD3T9P')
            }
        }
    } catch (err) {
        log.debug(err.response.data)
        res.status(404).send('not found')
    }
})

module.exports = router
