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

# Build Next.js (no database seeding at build time)
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install sqlite3 for database operations (needed for startup script)
RUN apk add --no-cache sqlite

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files (schema, migrations, generated client)
COPY --from=builder /app/prisma/schema.prisma ./prisma/
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy seed script and its dependencies
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/lib/password.ts ./lib/password.ts

# Copy package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install ONLY the dependencies needed for seeding (tsx, bcryptjs)
# This is a minimal install for runtime database operations
RUN npm install --omit=dev --no-save tsx bcryptjs

# Copy startup script
COPY scripts/startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Use startup script for runtime seeding
CMD ["/app/startup.sh"]

EXPOSE 8080
