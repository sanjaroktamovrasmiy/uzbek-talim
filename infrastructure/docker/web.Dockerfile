# ===========================================
# Web Frontend Dockerfile
# Multi-stage build for optimized production image
# ===========================================

# Stage 1: Dependencies
FROM node:20-alpine as deps

WORKDIR /app

# Copy package files
COPY apps/web/package.json apps/web/package-lock.json* ./

# Install dependencies (need dev dependencies for build)
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine as builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/ .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_APP_NAME

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Build the application
RUN npm run build

# Stage 3: Production with Nginx
FROM nginx:alpine as production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY infrastructure/nginx/spa.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

