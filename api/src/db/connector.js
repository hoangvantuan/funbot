const axios = require('axios')

class Connector {
    constructor(basePath, path) {
        this.url = `${basePath}/${path}`
    }

    save(data) {
        return axios.post(`${this.url}/post`, data)
    }

    get(data) {
        return axios.post(`${this.url}/get`, data)
    }

    update(data) {
        return axios.post(`${this.url}/put`, data)
    }

    delete(data) {
        return axios.post(`${this.url}/delete`, data)
    }
}

module.exports = Connector
