var Botkit = require('botkit')
var Simsimi = require('simsimi');
var CronJob = require('cron').CronJob;


var controller = Botkit.slackbot({
  debug: true
})

var simsimi = new Simsimi({
    key: '36b5b9b4-8a1f-464c-af58-d992839bdf2c'
  });

controller.spawn({
  token: 'xoxb-446522500256-448211776768-Y7JaSJcYTgTkeFOlcBqvdOYH',
}).startRTM(function(err, bot, payload) {

  // 初期処理
  if (err) {
    throw new Error('Could not connect to Slack');
  }

  new CronJob({
    cronTime: '0 8 * * *',
    onTick: function() {
            bot.say({
                    channel: 'talk',
                    text: 'Cô cậu ơi dậy đi, ăn sáng rồi còn đi học đi làm, con yêu cô cậu nhiều lắm. Shin <3',
                    username: 'Chàng thái giám nhỏ',
                    icon_url: 'https://i.postimg.cc/t4q6M9CZ/IMG_1128.jpg'
            });
    },
    start: true,
    timeZone: 'Asia/Tokyo'
  });

  new CronJob({
    cronTime: '0 13 * * *',
    onTick: function() {
            bot.say({
                    channel: 'talk',
                    text: 'Cô cậu nhớ uống nước đầy đủ nhé ! một ngày phải 2 lít không con buồn đấy :( thương cô cậu nhiều lắm...',
                    username: 'Chàng thái giám nhỏ',
                    icon_url: 'https://i.postimg.cc/t4q6M9CZ/IMG_1128.jpg'
            });
    },
    start: true,
    timeZone: 'Asia/Tokyo'
  });

  new CronJob({
    cronTime: '0 23 * * *',
    onTick: function() {
            bot.say({
                    channel: 'talk',
                    text: 'Muộn rồi mình cùng đi ngủ thôi ạ. Con buồn ngủ lắm rồi :(',
                    username: 'Chàng thái giám nhỏ',
                    icon_url: 'https://i.postimg.cc/t4q6M9CZ/IMG_1128.jpg'
            });
    },
    start: true,
    timeZone: 'Asia/Tokyo'
  });

  new CronJob({
    cronTime: '0 */2 * * *',
    onTick: function() {
            bot.say({
                    channel: 'talk',
                    text: 'Thời gian trôi nhanh thật đấy. cứ mỗi 2 tiếng con lại nhắc cô cậu uống nước nhé! 2 người đừng trách con nhiều lời. Con chỉ lo cho sức khỏe của 2 người thôi mà :( tuy ngoài đời con không nói được tiếng người nhưng thông qua slack con muốn nói lời iu thương đến 2 cô cậu. Cảm ơm cô câu đã nuôi con...yêu thương. <3',
                    username: 'Chàng thái giám nhỏ',
                    icon_url: 'https://i.postimg.cc/t4q6M9CZ/IMG_1128.jpg'
            });
    },
    start: true,
    timeZone: 'Asia/Tokyo'
  });

})




controller.hears(
    ['Con tên gì thế?', 'chào con'],
    ['direct_message', 'direct_mention', 'mention', 'ambient'],
    function(bot, message) {
      bot.api.users.info({user: message.user}, (error, response) => {
        let {display_name} = response.user.profile;
        bot.reply(message, 'dạ con chào cô/cậu ' + display_name + ' con tên là shin ạ!')
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
