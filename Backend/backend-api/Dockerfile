FROM node:20-alpine

# build docker image
WORKDIR /app

# copy source code and install dependency
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# expose port be
EXPOSE 8080

# command server be
CMD ["node", "dist/main.js"]