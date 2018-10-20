const Connnecter = require('./connector')

const { DBAPI_HOST } = process.env
const { DBAPI_PORT } = process.env
const baseURL = `${DBAPI_HOST}:${DBAPI_PORT}`

module.exports.SlackTeam = new Connnecter(
    baseURL,
    `/api/${process.env.VERSION}/slack/team`,
)

module.exports.SlackUser = new Connnecter(
    baseURL,
    `/api/${process.env.VERSION}/slack/user`,
)

module.exports.GoogleTeam = new Connnecter(
    baseURL,
    `/api/${process.env.VERSION}/google/token`,
)
