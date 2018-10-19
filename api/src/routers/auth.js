const express = require('express')
const SlackAuth = require('../auth/slack')
const db = require('../db')
const log = require('../log')

const router = express.Router()

router.get('/google/redirected', (req, res) => {
    log.debug(req.params)
    log.debug(req.body)

    res.send('ok')
})

router.get('/slack/url', (req, res) => {
    res.redirect(SlackAuth.getURL())
})

router.get('/slack/redirected', (req, res) => {
    const { query } = req

    if (!query.code) {
        res.send('code is invalid')
    }

    SlackAuth.getToken(query.code)
        .then(response => {
            db.SlackTeam.get({ team_id: response.data.team_id })
                .then(dbres => {
                    if (dbres.data.length) {
                        res.send('App was installed')
                    } else {
                        db.SlackTeam.save(response.data)
                            .then(() => {
                                // TODO: redirect to slack app
                                res.send('Install app success')
                            })
                            .catch(err => {
                                log.debug(err)
                                res.send('error')
                            })
                            .catch(err => {
                                log.debug(err)
                                res.send('error')
                            })
                    }
                })
                .catch(err => {
                    log.debug(err)
                    res.send('error')
                })
        })
        .catch(err => {
            log.debug(err)
            res.send('error')
        })
})

module.exports = router
