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
