FROM node:10.5.0-alpine

WORKDIR /app

RUN npm install && \
    npm run build

CMD ["sh","-c","npm start"]
