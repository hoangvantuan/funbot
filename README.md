# Funbot project

# ENV

手で設定する必要環境変数

```
FUNBOT_ENV=dev | prod
```

`FUNBOT_ENV`のバリューに予定 ENV 定義ファイルを作成します。（root フォルダ）
例：
FUNBOT_ENV=dev

```dev.env
VERSION=v1

# slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGN_SECRET=
SLACK_AUTH_URI=https://slack.com/oauth/authorize
SLACK_TOKEN_URI=https://slack.com/api/oauth.access
SLACK_REDIRECT_URI=
SLACK_SCOPES=bot,commands

SLACK_ALERT_TOKEN=

# google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_AUTH_URI=
GOOGLE_REDIRECT_URI=
GOOGLE_SCOPES=

# db
DB_PORT=27017
DB_HOST=
DB_NAME=funbot-dev
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=secret

# dbapi
DBAPI_PORT=8081
DBAPI_HOST=http://localhost

# api
API_PORT=8080

# encode key
AES_KEY=my44zx3UX9QtKGWE

# debug flag
# only develop environment
DEBUG=express:*
```
