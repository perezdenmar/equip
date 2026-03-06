FROM node:20-alpine

# Install OpenSSL and compatibility libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev

# Generate Prisma Client
RUN npx prisma generate

COPY . .
RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]