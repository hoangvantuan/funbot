const aesjs = require('aes-js')

module.exports.ConvertRowsToObject = rows => {
    const results = []

    if (!rows || rows.length === 0) {
        return []
    }

    const headers = rows[0]

    rows.map((values, index) => {
        if (index !== 0) {
            results[index - 1] = {}
            headers.map((value, i) => {
                results[index - 1][value] = values[i]
            })
        }
    })

    return results
}

module.exports.Encode = text => {
    const keyBytes = aesjs.utils.utf8.toBytes(process.env.AES_KEY)
    const textBytes = aesjs.utils.utf8.toBytes(text)
    const aes = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5))

    return aesjs.utils.hex.fromBytes(aes.encrypt(textBytes))
}

module.exports.Decode = text => {
    const keyBytes = aesjs.utils.utf8.toBytes(process.env.AES_KEY)
    const textBytes = aesjs.utils.hex.toBytes(text)
    const aes = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5))

    return aesjs.utils.utf8.fromBytes(aes.decrypt(textBytes))
}

module.exports.RandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max))
}

module.exports.RandomString = max => {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < max; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
}

module.exports.TextWithSettings = text => {
    return {
        text,
        attachments: [
            {
                callback_id: 'settings',
                color: '#3AA3E3',
                attachment_type: 'default',
                fallback: 'setting for app',
                actions: [
                    {
                        name: 'list',
                        text: 'List spreadsheet',
                        type: 'button',
                        value: 'list',
                        style: 'default',
                    },
                    {
                        name: 'add',
                        text: 'Add spreadsheet',
                        type: 'button',
                        value: 'add',
                        style: 'primary',
                    },
                    {
                        name: 'remove',
                        text: 'Remove spreadsheet',
                        type: 'button',
                        value: 'remove',
                        style: 'danger',
                    },
                    {
                        name: 'cancel',
                        text: 'Tắt đi.',
                        type: 'button',
                        value: 'cancel',
                        style: 'default',
                    },
                ],
            },
        ],
    }
}

module.exports.TextWithRestartJob = text => {
    return {
        text,
        attachments: [
            {
                callback_id: 'restart',
                color: '#3AA3E3',
                attachment_type: 'default',
                fallback: 'restart job',
                actions: [
                    {
                        name: 'restart-job',
                        text: 'Restart',
                        type: 'button',
                        value: 'restart-job',
                        style: 'primary',
                    },
                    {
                        name: 'cancel',
                        text: 'Tắt đi.',
                        type: 'button',
                        value: 'cancel',
                        style: 'default',
                    },
                ],
            },
        ],
    }
}
