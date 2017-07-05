
# specify our base image
FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# should only need to expose the /collector and /reporter ports
EXPOSE 80 443 3000 8080

# finally launch our app
CMD [ "npm", "start" ]
