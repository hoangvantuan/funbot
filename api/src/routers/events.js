const express = require('express')
const db = require('../db')
const log = require('../log')

const router = express.Router()

router.post('/', async (req, res) => {
    log.debug(req.body)

    if (req.body.type === 'url_verification') {
        res.send({ challenge: req.body.challenge })
        return
    }

    const { type } = req.body.event

    // remove app, all tokens
    // TODO: remove all relate google token
    if (type === 'tokens_revoked') {
        const teamRes = await db.SlackTeam.get({ team_id: req.body.team_id })
        if (teamRes.data.data.length > 0) {
            const usersRes = await db.SlackUser.get({
                slack_team: teamRes.data.data[0]._id,
            })

            if (usersRes.data.data.length > 0) {
                usersRes.data.data.forEach(user => {
                    if (user.google_tokens.length > 0) {
                        db.GoogleToken.delete({
                            _id: user.google_tokens[0]._id,
                        })
                    }

                    db.SlackUser.delete({ _id: user._id })
                })
            }
            db.SlackTeam.delete({ team_id: req.body.team_id })
        }
    }

    res.status(200).end()
})

module.exports = router
