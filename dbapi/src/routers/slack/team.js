const express = require('express')
const common = require('../common')('SlackTeam')

const router = express.Router()

common.use(router)

module.exports = router
