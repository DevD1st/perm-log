FROM node:16-alpine

WORKDIR /src/perm-log/log

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . .

CMD [ "npm", "run", "start:dev" ]