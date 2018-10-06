const Botkit = require('botkit')
const Simsimi = require('simsimi');
const config = require('./config')
const data = require('./data')


var controller = Botkit.slackbot({
  debug: false
})

var simsimi = new Simsimi({
  key: config.SIMI_TOKEN,
  ft: config.SIMI_FILTER
});

controller.spawn({
  token: config.SLACK_TOKEN,
}).startRTM(function (err, bot, payload) {

  // 初期処理
  if (err) {
    throw new Error('Could not connect to Slack');
  }

  data.updateAll(bot)

})

controller.hears(
  ['update'],
  ['direct_message'],
  function (bot, message) {
    data.updateAll(bot)
  })

controller.hears(
  ['list'],
  ['direct_message'],
  function (bot, message) {
    data.list()
  })

controller.hears(
  ['Con tên gì thế?', 'chào con'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  function (bot, message) {
    bot.api.users.info({ user: message.user }, (error, response) => {
      let { display_name } = response.user.profile;
      bot.reply(message, 'dạ con chào cô/cậu ' + display_name + ' con tên là shin ạ!')
    })
  })

controller.hears(
  ['Con tên gì thế?', 'chào con'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  function (bot, message) {
    bot.api.users.info({ user: message.user }, (error, response) => {
      let { display_name } = response.user.profile;

      if (display_name == 'shun') {
        bot.reply(message, 'dạ con chào cậu ' + display_name + ' con tên là shin ạ!')
      } else {
        bot.reply(message, 'dạ con chào cô ' + display_name + ' con tên là shin ạ!')
      }
    })
  })

controller.hears(
  ['con thấy cô quyên xinh hem?'],
  ['direct_message', 'direct_mention', 'mention'],
  function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
      bot.reply(message, 'Meow ! cô quyên xinh nhất Quảng Yên Meow!')
    })
  })

controller.hears('',
  ['direct_message', 'direct_mention', 'mention'],
  function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
      simsimi.listen(message.text, function (err, msg) {
        if (err) return console.error(err);
        bot.reply(message, msg)
      });
    })
  })

controller.hears('(.*)sim(.*)',
  ['ambient'],
  function (bot, message) {
    controller.storage.users.get(message.user, function (err, user) {
      simsimi.listen(message.text, function (err, msg) {
        if (err) return console.error(err);
        bot.reply(message, msg)
      });
    })
  })
