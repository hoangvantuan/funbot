const db = require('../models')

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
            if (err) return res.status(406).send(JSON.stringify({ err }))

            res.send(JSON.stringify(result))
        })
    })

    router.post('/put', (req, res) => {
        const model = db[this.name]

        model.updateMany(
            JSON.parse(req.body.query),
            JSON.parse(req.body.value),
            { runValidators: true, context: 'query' },
            (err, result) => {
                if (err) res.status(404).send(JSON.stringify({ err }))

                res.send(JSON.stringify(result))
            },
        )
    })

    router.post('/get', (req, res) => {
        const model = db[this.name]

        model.find(req.body, (err, result) => {
            if (err) res.status(404).send(JSON.stringify({ err }))

            res.send(JSON.stringify(result))
        })
    })

    router.post('/delete', (req, res) => {
        const model = db[this.name]

        model.deleteMany(req.body, (err, result) => {
            if (err) res.status(404).send(JSON.stringify({ err }))

            res.send(JSON.stringify(result))
        })
    })
}

module.exports = Common
