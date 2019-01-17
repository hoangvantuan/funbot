const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${
    process.env.DB_HOST
}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`

console.log(('connect to ', uri))

mongoose.connect(
    uri,
    { useNewUrlParser: true },
)

const db = {}

fs.readdirSync(__dirname)
    .filter(file => {
        return file.indexOf('.') !== 0 && file !== 'index.js'
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))

        db[model.modelName] = model
    })

db.mongoose = mongoose

module.exports = db
