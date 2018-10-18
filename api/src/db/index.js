const axios = require('axios')

const DBAPI_HOST = process.env.DBAPI_HOST
const DBAPI_PORT = process.env.DBAPI_PORT
const dbapiURL = `${DBAPI_HOST}:${DBAPI_PORT}`

class DB {
    static Save(path, data) {
        const url = `${dbapiURL}/${path}/post`        
        return axios.post(url, data)
    }

    static Get(path, data) {
        const url = `${dbapiURL}/${path}/get`        
        return axios.post(url, data)
    }

    static Update(path, data) {
        const url = `${dbapiURL}/${path}/update`        
        return axios.post(url, data)
    }

    static Delete(path, data) {
        const url = `${dbapiURL}/${path}/delete`        
        return axios.post(url, data)
    }
}

module.exports = DB