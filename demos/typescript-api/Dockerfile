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

# Stage 2: Production Runtime
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime

# Set working directory
WORKDIR /app

# Copy built application and production dependencies from builder
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./

# Security: Use distroless base image (no shell, package managers, etc.)
# Security: Run as non-root user (distroless nonroot user)
USER nonroot

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"]

# Expose port (non-privileged port)
EXPOSE 3000

# Start the application
CMD ["dist/app.js"]

# Metadata
LABEL maintainer="CI/CD Training Team" \
      version="1.0.0" \
      description="TypeScript API Demo for CI/CD Training" \
      security.scan="enabled"
