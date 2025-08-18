FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++ bash

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
