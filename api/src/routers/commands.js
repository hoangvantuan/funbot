const express = require('express')
const db = require('../db')
const GoogleAuth = require('../auth/google')

const router = express.Router()

router.post('/', (req, res) => {
    const message = {
        text: 'Cho mình quyền truy cập vào google spreasheet của ấy nhé?',
        attachments: [
            {
                callback_id: 'auth_google_spreasheet',
                color: '#3AA3E3',
                attachment_type: 'default',
                actions: [
                    {
                        name: 'GoogleAuthOk',
                        text: 'Ok ấy',
                        type: 'button',
                        url: GoogleAuth.getURL(),
                        style: 'primary',
                    },
                    {
                        name: 'GoogleAuthCancel',
                        text: 'Thôi mình không muốn đâu.',
                        type: 'button',
                        value: 'GoogkeAuthCancel',
                        style: 'danger',
                    },
                ],
            },
        ],
    }

    res.send(message)
})

module.exports = router
