FROM node:12.5.0-alpine

EXPOSE 10080

WORKDIR /app

COPY . /app

RUN npm install && \
            npm run build

CMD ["sh","-c","npm start"]
