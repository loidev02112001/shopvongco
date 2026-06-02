FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server.js migrate-base64.js ./

ENV NODE_ENV=production
ENV UPLOAD_DIR=/uploads

EXPOSE 3001

CMD ["npm", "start"]
