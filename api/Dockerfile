FROM node:10

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY src/ .
RUN npm install

CMD [ "npm", "start" ]