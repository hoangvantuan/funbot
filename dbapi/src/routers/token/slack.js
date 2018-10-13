const express = require('express')
const common = require('../common')('SlackToken')

const router = express.Router()

common.use(router)

module.exports = router
