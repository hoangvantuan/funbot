const express = require('express')

const router = express.Router()

const ver = process.env.VERSION

router.use(`/api/${ver}/auth`, require('./auth'))

router.get('/', (req, res) => {
    res.send(`slack app api ${process.env.VERSION} is working`)
})

module.exports = router
