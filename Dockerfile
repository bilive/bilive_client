FROM node:10.5.0-alpine

EXPOSE 10080

WORKDIR /app

ONBUILD COPY . /app

ONBUILD RUN npm install && \
            npm run build

CMD ["sh","-c","npm start"]
