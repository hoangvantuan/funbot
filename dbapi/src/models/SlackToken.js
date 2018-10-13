const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const { Schema } = mongoose

const SlackToken = new Schema(
    {
        token_scope: {
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
        expired: {
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

SlackToken.plugin(uniqueValidator)

module.exports = mongoose.model('SlackToken', SlackToken)
