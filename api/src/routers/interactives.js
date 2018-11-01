const express = require('express')
const axios = require('axios')
const log = require('../log')

const router = express.Router()

router.post('/', async (req, res) => {
    res.status(200).end()
    log.debug(req.body)

    const payload = JSON.parse(req.body.payload)

    if (payload.callback_id === 'auth_google_spreasheet_cancel') {
        axios.post(payload.response_url, {
            response_type: 'ephemeral',
            replace_original: true,
            delete_original: true,
            text: '',
        })
    }
})

module.exports = router
