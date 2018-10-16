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

controller.hears(
    ['Con tên gì thế?', 'chào con'],
    ['direct_message', 'direct_mention', 'mention', 'ambient'],
    (bot, message) => {
        bot.api.users.info({ user: message.user }, (error, response) => {
            const { display_name } = response.user.profile
            bot.reply(
                message,
                `dạ con chào cô/cậu ${display_name} con tên là shin ạ!`,
            )
        })
    },
)

controller.hears(
    ['Con tên gì thế?', 'chào con'],
    ['direct_message', 'direct_mention', 'mention', 'ambient'],
    (bot, message) => {
        bot.api.users.info({ user: message.user }, (error, response) => {
            const { display_name } = response.user.profile

            if (display_name === 'shun') {
                bot.reply(
                    message,
                    `dạ con chào cậu ${display_name} con tên là shin ạ!`,
                )
            } else {
                bot.reply(
                    message,
                    `dạ con chào cô ${display_name} con tên là shin ạ!`,
                )
            }
        })
    },
)

controller.hears(
    ['con thấy cô quyên xinh hem?'],
    ['direct_message', 'direct_mention', 'mention'],
    (bot, message) => {
        controller.storage.users.get(message.user, () => {
            bot.reply(message, 'Meow ! cô quyên xinh nhất Quảng Yên Meow!')
        })
    },
)
