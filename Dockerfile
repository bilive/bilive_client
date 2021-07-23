FROM node:14-alpine

WORKDIR /app
COPY . /app
RUN npm install && npm run build

EXPOSE 10086
CMD ["npm", "start"]
