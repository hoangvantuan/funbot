const express = require('express')
const log = require('../log')

const router = express.Router()

router.post('/', async (req, res) => {
    log.debug(req.body)

    const payload = JSON.parse(req.body.payload)

    if (payload.callback_id === 'auth_google_spreasheet_cancel') {
        res.send({
            response_type: 'ephemeral',
            replace_original: true,
            delete_original: true,
            text: '',
        })
    }
})

module.exports = router
