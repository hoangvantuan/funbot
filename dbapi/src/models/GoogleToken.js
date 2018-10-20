const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const { Schema } = mongoose

const GoogleToken = new Schema(
    {
        scope: {
            type: String,
            required: true,
        },
        token_type: {
            type: String,
            required: true,
        },
        access_token: {
            type: String,
            required: true,
            unique: true,
        },
        refresh_token: {
            type: String,
            required: true,
            unique: true,
        },
        expiry_date: {
            type: Date,
        },
    },
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'update_at',
        },
    },
)

GoogleToken.plugin(uniqueValidator)

module.exports = mongoose.model('GoogleToken', GoogleToken)
