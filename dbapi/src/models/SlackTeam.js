const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const { Schema } = mongoose

const SlackTeam = new Schema(
    {
        team_id: {
            type: String,
            required: true,
            unique: true,
        },
        user_id: {
            type: String,
            required: true
        },
        team_name: {
            type: String,
            required: true,
        },
        scope: {
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
            unique: true,
        },
        bot: {
            bot_user_id: {
                type: String
            },
            bot_access_token: {
                type: String
            }
        }
    },
    {
        timestamps: {
            createdAt: 'create_at',
            updatedAt: 'update_at',
        },
    },
)

SlackTeam.plugin(uniqueValidator)

module.exports = mongoose.model('SlackTeam', SlackTeam)
