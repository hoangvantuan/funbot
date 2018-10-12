FROM node:argon

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY src/ .
RUN npm install

#Expose port and start application
EXPOSE 8080
CMD [ "npm", "start" ]