var Botkit = require('botkit')
var http = require('http')
var Simsimi = require('simsimi');


var controller = Botkit.slackbot({
  debug: true
})

var simsimi = new Simsimi({
    key: '36b5b9b4-8a1f-464c-af58-d992839bdf2c'
  });

controller.spawn({
  token: 'xoxb-446522500256-448211776768-Y7JaSJcYTgTkeFOlcBqvdOYH',
}).startRTM()

controller.hears(
    ['Con tên gì thế?', 'chào con'],
    ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) {
      controller.storage.users.get(message.user, function(err, user) {
              bot.reply(message, 'dạ con chào ' + message.user.name + ' con tên là shin ạ!')
      })
  })

  controller.hears(
    ['con thấy cô quyên xinh hem?'],
    ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) {
      controller.storage.users.get(message.user, function(err, user) {
              bot.reply(message, 'Meow ! cô quyên xinh nhất Quảng Yên Meow!')
      })
  })

  controller.hears('',
    ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) {
      controller.storage.users.get(message.user, function(err, user) {
          console.log(message);
          
        simsimi.listen(message.text, function(err, msg){
            if(err) return console.error(err);
            console.log("Message" + msg);
            
            bot.reply(message, msg)
          });
      })
  })