const express = require('express')
const log = require('../log')

const router = express.Router()

router.post('/', async (req, res) => {
    log.debug(req.body)

    const payload = JSON.parse(req.body.payload)

    if (payload.callback_id === 'auth_google_spreasheet_cancel') {
        res.send({
            replace_original: true,
            text: 'Thanks you',
        })
    }
})

module.exports = router
