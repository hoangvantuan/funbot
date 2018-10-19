# MongoDB API

build image
```
docker build -t dbapi:1.0 . 
```

run container
```
docker run -it -p 8081:8081 --env-file /path_to_env_file --name dbapi dbapi:1.0
```