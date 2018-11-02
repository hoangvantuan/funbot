const express = require('express')
const bodyParser = require('body-parser')
const log = require('./log')

const api = express()

api.use(bodyParser.urlencoded({ extended: true }))
api.use(bodyParser.json())

api.use(require('./routers'))

// catch 404 and forward to error handler
api.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

const server = api.listen(process.env.DBAPI_PORT || 8081, () => {
    log.info(`Listening on port ' ${server.address().port}`)
})
