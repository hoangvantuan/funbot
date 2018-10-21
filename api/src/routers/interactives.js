const express = require('express')
const db = require('../db')

const router = express.Router()

router.post('/', (req, res) => {
    console.log(req)

    res.send({
        replace_original: true,
        text:
            'Cám ơn ấy nhé. từ giờ bạn có thể tạo spreasheet để remind rồi :) ',
    })
})

module.exports = router
