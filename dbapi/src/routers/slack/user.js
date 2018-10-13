const express = require('express')
const common = require('../common')('SlackUser')

const router = express.Router()

common.use(router)

module.exports = router
