const express = require('express')
const db = require('../db')
const log = require('../log')

const router = express.Router()

router.post('/', async (req, res) => {
    res.status(200).end()
    if (req.body.challenge) {
        res.send({ challenge: req.body.challenge })
    }

    log.debug(req.body)
    const { type } = req.body.event

    // remove app, all tokens
    // TODO: remove all relate google token
    if (type === 'tokens_revoked') {
        db.SlackTeam.delete({ team_id: req.body.team_id })
    }
})

module.exports = router
