const express = require('express')

const router = express.Router()

const ver = process.env.VERSION

router.use(`/api/${ver}/slack/team`, require('./slack/team'))

router.use(`/api/${ver}/slack/user`, require('./slack/user'))

router.use(`/api/${ver}/token/google`, require('./token/google'))

router.use(`/api/${ver}/token/slack`, require('./token/slack'))

router.get('/', (req, res) => {
    res.send(`funbot db api ${ver} is working!`)
})

module.exports = router
