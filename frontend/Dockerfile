# Development Dockerfile for React Frontend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (dev mode)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Development mode with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

