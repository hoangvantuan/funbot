const express = require('express')
const axios = require('axios')
const SlackAuth = require('../auth/slack')
const GoogleAuth = require('../auth/google')
const db = require('../db')
const log = require('../log')
const util = require('../util')

const router = express.Router()

router.get('/google/redirected', (req, res) => {
    log.debug('Auth new google token', req.query)

    if (req.query && req.query.code) {
        const state = JSON.parse(util.Decode(req.query.state))

        log.debug('state ', state)

        if (state.response_url) {
            axios.post(state.response_url, {
                response_type: 'ephemeral',
                replace_original: true,
                delete_original: true,
                text: 'Ok giờ bạn có thể dùng mình thoải mái rùi!!',
            })
        }

        GoogleAuth.getToken(req.query.code).then(tokens => {
            // remove all old token
            db.SlackUser.get({ user_id: state.user_id })
                .then(userRes => {
                    if (userRes.data.data[0].google_tokens) {
                        const googleTokenID = userRes.data.data[0].google_tokens._id

                        log.debug('remove google token', googleTokenID, 'userID', state.user_id)

                        db.GoogleToken.delete({ _id: googleTokenID })
                    }

                    // save new token
                    db.GoogleToken.save(tokens.tokens)
                        .then(result => {
                            const query = {
                                query: JSON.stringify({
                                    user_id: state.user_id,
                                }),
                                value: JSON.stringify({
                                    google_tokens: result.data.data._id,
                                }),
                            }

                            db.SlackUser.update(query)
                                .then(() => {
                                    log.info('new google token was generate for userid ', state.user_id)
                                    res.send('ok ')
                                })
                                .catch(err => {
                                    log.error(err)
                                    res.send('error')
                                })
                        })
                        .catch(err => {
                            log.error(err)
                            res.send('not found')
                        })
                })
                .catch(err => {
                    log.error(err)
                    res.send('not found')
                })
        })
    } else {
        log.error('not valid requret', req)
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
    log.debug(req.query)

    const { query } = req

    if (!query.code) {
        log.error('not valid request', req)
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
            tokens.data.bot.bot_access_token = util.Encode(tokens.data.bot.bot_access_token)

            if (team.data && team.data.data.length > 0) {
                await db.SlackTeam.update({
                    query: `{"team_id": "${tokens.data.team_id}"}`,
                    value: JSON.stringify(tokens.data),
                })

                log.info('app was reinstall for workspace', team.data.team_name)

                res.redirect('https://slack.com/app_redirect?app=ADHDD3T9P')
            } else {
                await db.SlackTeam.save(tokens.data)

                log.info('app was install for workspace', team.data.team_name)

                res.redirect('https://slack.com/app_redirect?app=ADHDD3T9P')
            }
        }
    } catch (err) {
        if (err.response) {
            log.error(err.response.data)
            log.error(err.response.status)
            log.error(err.response.headers)
        } else if (err.request) {
            log.error(err.request)
        } else {
            log.error('unknown error', err)
        }

        res.status(400).send('Bad request')
    }
})

module.exports = router
