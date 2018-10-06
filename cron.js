const CronManager = require('cron-job-manager')

function Cron() {    
    if (!(this instanceof Cron))
        return new Cron()
    this.manager = new CronManager()
    return this
}

Cron.prototype.addAndStart = function(values, type) {


    this.bot.say({
        channel: 'log',
        text: "Staring updating jobs cron list type " + type ,
        username: 'logger',
        icon_url: 'https://cdn2.iconfinder.com/data/icons/security-2-1/512/debugger-512.png'
    });

    if (type == 'reminder') {
        values.map((val, i) => {
            this.manager.add(
                val.key,
                val.time,
                () => {
                    this.bot.say({
                        channel: val.to,
                        text: val.content,
                        username: val.username,
                        icon_url: val.icon
                    });
                }
            )

            this.manager.start(val.key)
        })


    } else if (type == 'ngontinh') {
        this.manager.add(
            
            values[0].key,
            values[0].time,
            () => {
                const index = getRandomInt(values.length - 1)
                this.bot.say({
                    channel: values[0].to,
                    text: `${values[index].content}\n${values[index].image}`,
                    username: values[0].username,
                    icon_url: values[0].icon
                });
            }
        )

        this.manager.start(values[0].key)
    }

    this.bot.say({
        channel: 'log',
        text: "Done updated jobs cron list type " + type,
        username: 'logger',
        icon_url: 'https://cdn2.iconfinder.com/data/icons/security-2-1/512/debugger-512.png'
    });
}

Cron.prototype.deleteAll = function() {

    this.bot.say({
        channel: 'log',
        text: "Done delete jobs cron list...",
        username: 'logger',
        icon_url: 'https://cdn2.iconfinder.com/data/icons/security-2-1/512/debugger-512.png'
    });

    jobs = this.manager.jobs

    for (key in jobs) {
        console.log("key" , key);
        
        this.manager.deleteJob(key)
    }

    this.bot.say({
        channel: 'log',
        text: "Done delete jobs cron list...",
        username: 'logger',
        icon_url: 'https://cdn2.iconfinder.com/data/icons/security-2-1/512/debugger-512.png'
    });
}

Cron.prototype.listJobs = function() {
    jobs = this.manager.listCrons()
    this.bot.say({
        channel: 'log',
        text: `List job\n${jobs}`,
        username: 'logger',
        icon_url: 'https://cdn2.iconfinder.com/data/icons/security-2-1/512/debugger-512.png'
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = Cron