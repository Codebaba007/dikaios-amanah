# Dikaios Amanah frontend — local development image
# Production builds are served by Vercel (see frontend/vercel.json).
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
