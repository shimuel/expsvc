FROM node:12.0-slim
WORKDIR /app-api
COPY ./package*.json /app-api/
RUN npm install
COPY . .
EXPOSE 3001
CMD [ "node", "service.js" ]
