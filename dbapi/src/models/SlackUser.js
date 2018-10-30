const mongoose = require('mongoose')

const { Schema } = mongoose

const SlackUser = new Schema(
    {
        user_id: {
            type: String,
            required: true,
        },
        slack_team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SlackTeam',
            required: true,
        },
        google_tokens: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GoogleToken',
            },
        ],
        sheets: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'update_at',
        },
    },
)

module.exports = mongoose.model('SlackUser', SlackUser)
