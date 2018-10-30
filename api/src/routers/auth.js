const express = require('express')
const axios = require('axios')
const SlackAuth = require('../auth/slack')
const GoogleAuth = require('../auth/google')
const db = require('../db')
const log = require('../log')
const util = require('../util')

const router = express.Router()

router.get('/google/redirected', (req, res) => {
    if (req.query && req.query.code) {
        const state = JSON.parse(util.Decode(req.query.state))

        if (state.responseURL) {
            axios.post(state.responseURL, {
                replace_original: true,
                text: 'Thanks you for give me can access to spreasheet',
            })
        }

        GoogleAuth.getToken(req.query.code).then(tokens => {
            // remove all old token
            db.SlackUser.get({ user_id: state.userID })
                .then(userRes => {
                    if (userRes.data.data[0].google_tokens.length > 0) {
                        const googleTokenID = userRes.data.data[0].google_tokens[0]._id
                        db.GoogleToken.delete({ _id: googleTokenID })
                    }

                    // save new token
                    db.GoogleToken.save(tokens.tokens)
                        .then(result => {
                            const query = {
                                query: JSON.stringify({
                                    user_id: state.userID,
                                }),
                                value: JSON.stringify({
                                    google_tokens: [result.data.data._id],
                                }),
                            }

                            db.SlackUser.update(query)
                                .then(() => {
                                    res.send('ok ')
                                })
                                .catch(err => {
                                    log.debug(err)
                                    res.send('error')
                                })
                        })
                        .catch(err => {
                            log.debug(err)
                            res.send('not found')
                        })
                })
                .catch(err => {
                    log.debug(err)
                    res.send('not found')
                })
        })
    } else {
        res.send('not found')
    }
})

router.get('/slack/url', (req, res) => {
    res.redirect(SlackAuth.getURL())
})

router.get('/google/url', (req, res) => {
    res.redirect(GoogleAuth.getURL())
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
        if (err.response) {
            log.debug(err.response.data)
            log.debug(err.response.status)
            log.debug(err.response.headers)
        } else if (err.request) {
            log.debug(err.request)
        } else {
            log.debug('unknown error')
        }

        res.status(400).send('Bad request')
    }
})

module.exports = router
