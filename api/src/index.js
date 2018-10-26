const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const fs = require('fs')

const log = require('./log')

if (!process.env.VERSION) {
    require('dotenv').config({ path: '../../.env' })
}

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

const server = https
    .createServer(
        {
            key: fs.readFileSync('../../server.key'),
            cert: fs.readFileSync('../../server.cert'),
        },
        api,
    )
    .listen(process.env.API_PORT || 8080, () => {
        log.debug(`Listening on port ' ${server.address().port}`)
    })
