# TypeScript API - Production Docker Image
# Multi-stage build for security and optimization

# Stage 1: Build Environment
FROM node:20-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build && \
    npm prune --omit=dev --no-audit --no-fund

# Stage 2: Production Runtime - Use Node Alpine for minimal attack surface
FROM node:20-alpine AS runtime

# Security: Install latest security updates and create non-root user
RUN apk update && apk upgrade && apk add --no-cache dumb-init wget && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application and production dependencies from builder
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./

# Security: Run as non-root user
USER nodeuser

# Health check (use wget instead of node to avoid permission issues)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose port (non-privileged port)
EXPOSE 3000

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]

# Metadata
LABEL maintainer="CI/CD Training Team" \
      version="1.0.0" \
      description="TypeScript API Demo for CI/CD Training" \
      security.scan="enabled"
