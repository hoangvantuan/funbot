const express = require('express')
const SlackAuth = require('../auth/slack')
const db = require('../db')

const router = express.Router()

router.get('/google/redirected', (req, res) => {
    console.log(req.params)
    console.log(req.body);
    
    res.send("ok")
})

router.get('/slack/url', (req, res) => { 
    // TODO: need check api key
    res.redirect(SlackAuth.getURL())
})

router.get('/slack/redirected', (req, res) => {
    const query = req.query

    if(!query.code) {
        res.send("code is invalid")
    }

    SlackAuth.getToken(query.code).then(response => {
        db.Get('api/v1/slack/team', {team_id: response.data.team_id}).then(dbres => {
            if(dbres.data.length) {
                res.send("App was installed")
            } else {
                db.Save('api/v1/slack/team', response.data).then(() => {
                    // TODO: redirect to slack app
                    res.send("Install app success")
                }).catch(err => {
                    console.log(err);
                    res.send("error")
                }).catch(err => {
                    console.log(err);
                    res.send('error')
                })
            }
        }).catch(err => {
            console.log(err);
            res.send("error")
        })
    }).catch(err => {
        console.log(err);
        res.send("error")
    })
})

module.exports = router