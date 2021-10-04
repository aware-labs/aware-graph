FROM node:10

WORKDIR /usr/src/aware-graph

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]