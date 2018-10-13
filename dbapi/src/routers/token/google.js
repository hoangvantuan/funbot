const express = require('express')
const common = require('../common')('GoogleToken')

const router = express.Router()

common.use(router)

module.exports = router
