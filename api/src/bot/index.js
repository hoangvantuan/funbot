const Slack = require('slack')
const db = require('../db')
const log = require('../log')
const util = require('../util')

module.exports.BotAPI = async teamID => {
    log.debug('create bot api for team id', teamID)

    const res = await db.SlackTeam.get({ team_id: teamID })

    log.debug(res.data)

    if (res.data.statusText === 'ok' && res.data.data.length === 1) {
        const team = res.data.data[0]

        return new Slack({ token: util.Decode(team.bot.bot_access_token) })
    }

    throw new Error('can not create slack api client')
}
