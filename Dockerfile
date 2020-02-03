FROM gitlab.vascomm.co.id:4567/backend-docker-image/node-8-slim:latest

#RUN npm config set proxy http://192.168.13.6:3128
#RUN npm config set https-proxy http://192.168.13.6:3128

# change our application's nodejs dependencies:
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm install --production

COPY . /usr/src/app

#ecosystem file ecosystem.json
CMD ["pm2-docker", "start", "ecosystem.docker.json"]
