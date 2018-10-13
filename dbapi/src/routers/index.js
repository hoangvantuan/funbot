const express = require('express')

const router = express.Router()

router.use('/api/v1/slack/team', require('./slack/team'))

router.use('/api/v1/slack/user', require('./slack/user'))

router.use('/api/v1/token/google', require('./token/google'))

router.use('/api/v1/token/slack', require('./token/slack'))

router.get('/', (req, res) => {
    res.send('funbot db api v1 is working!')
})

module.exports = router
