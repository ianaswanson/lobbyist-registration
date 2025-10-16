# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Create and seed database (during build)
RUN npx prisma migrate deploy
RUN npm run db:seed

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy the seeded database from builder
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:./prisma/dev.db"

# Create database directory
RUN mkdir -p /app/prisma

# Start server (database already seeded during build)
CMD ["node", "server.js"]

EXPOSE 8080
