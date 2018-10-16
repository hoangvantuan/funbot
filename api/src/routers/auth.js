const express = require('express')

const router = express.Router()

router.get('/google/redirected', (req, res) => {
    console.log(req.param)
    console.log(req);
})

module.exports = router