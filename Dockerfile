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
# Set DATABASE_URL for build-time operations (absolute path to avoid nesting)
ENV DATABASE_URL="file:/app/prisma/dev.db"
RUN npx prisma migrate deploy
RUN npm run db:seed

# Verify database was created
RUN ls -lh /app/prisma/dev.db

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

# Copy Prisma schema and migrations (WITHOUT the database files from .dockerignore)
COPY --from=builder /app/prisma/schema.prisma ./prisma/
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Now explicitly copy the seeded database from the builder stage
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Start server (database already seeded during build)
CMD ["node", "server.js"]

EXPOSE 8080
