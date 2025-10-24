# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory to /app
WORKDIR /app

# Copy package files 
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app directory to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "src/server.js"]