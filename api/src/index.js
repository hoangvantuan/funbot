const Botkit = require('botkit')
const data = require('./data')

const controller = Botkit.slackbot({
    debug: true,
})

controller
    .spawn({
        token: process.env.SLACK_TOKEN,
    })
    .startRTM((err, bot) => {
        // 初期処理
        if (err) {
            throw new Error('Could not connect to Slack')
        }

        data.updateAll(bot)
    })

controller.hears(['update'], ['direct_message'], bot => {
    data.updateAll(bot)
})

controller.hears(['list'], ['direct_message'], () => {
    data.list()
})

