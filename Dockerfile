FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "build", "--", "--outDir", "/app/dist", "--emptyOutDir"]