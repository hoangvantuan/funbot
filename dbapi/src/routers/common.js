const db = require('../models')
const log = require('../log')

function wrapResult(data, ok) {
    if (ok) {
        return { statusText: 'ok', data }
    }

    return { statusText: 'no ok', data }
}

function Common(modelname) {
    if (!(this instanceof Common)) {
        return new Common(modelname)
    }

    this.name = modelname
    return this
}

Common.prototype.use = function(router) {
    router.post('/post', (req, res) => {
        const team = new db[this.name](req.body)

        team.save((err, result) => {
            if (err) {
                log.error(err)
                res.status(400).send(wrapResult(err))
            } else {
                res.send(wrapResult(result, true))
            }
        })
    })

    router.post('/put', (req, res) => {
        const model = db[this.name]

        model.updateMany(
            JSON.parse(req.body.query),
            JSON.parse(req.body.value),
            { runValidators: true, context: 'query' },
            (err, result) => {
                if (err) {
                    log.error(err)
                    res.status(400).send(wrapResult(err))
                }

                res.send(wrapResult(result, true))
            },
        )
    })

    router.post('/get', (req, res) => {
        const model = db[this.name]

        model.find(req.body, (err, result) => {
            if (err) {
                log.error(err)
                res.status(400).send(wrapResult(err))
            }

            res.send(wrapResult(result, true))
        })
    })

    router.post('/delete', (req, res) => {
        const model = db[this.name]

        model.deleteMany(req.body, (err, result) => {
            if (err) {
                log.error(err)
                res.status(400).send(wrapResult(err))
            }

            res.send(wrapResult(result, true))
        })
    })
}

module.exports = Common
