const express = require('express')
const db = require('../db')

const router = express.Router()

router.post('/', (req, res) => {
    res.status(200).end()
    console.log(req.body)
    if (req.body.challenge) {
        res.send({ challenge: req.body.challenge })
    }

    const { type } = req.body.event

    // remove app, all tokens
    // TODO: remove all relate google token
    if (type === 'tokens_revoked') {
        db.SlackTeam.delete({ team_id: req.body.team_id })
    }
})

module.exports = router
