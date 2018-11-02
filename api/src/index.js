const express = require('express')
const bodyParser = require('body-parser')
const log = require('./log')

const api = express()

api.use(express.static('public'))

api.use(bodyParser.urlencoded({ extended: true }))
api.use(bodyParser.json())

api.use(require('./routers'))

api.use((req, res) => {
    res.status(404).send('Something wrong')
})

api.listen(process.env.API_PORT || 8080, '172.0.0.1')

// starting worker
const worker = require('./worker')

worker.start()
