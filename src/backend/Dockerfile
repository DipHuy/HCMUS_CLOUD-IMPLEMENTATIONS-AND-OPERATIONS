FROM node:24-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .

# Create Prisma Client
RUN npx prisma generate
EXPOSE 3000

# Run the command to push the database schema and start the application
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node src/index.js"]