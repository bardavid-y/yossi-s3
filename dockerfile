# FROM node:20-alpine
# WORKDIR /app
# # Copy package files and install all dependencies
# COPY package*.json ./
# RUN npm install
# # Copy the rest of the source code
# COPY . .
# # Use nodemon for hot-reloading
# CMD ["npx", "nodemon", "server.js"]

# multi stage 
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install all dependencies (including devDependencies if you have build steps)
RUN npm install
COPY . .

# Stage 2: Production Runner
FROM node:20-alpine
WORKDIR /app
# Set environment to production
ENV NODE_ENV=production
# Copy only necessary files from builder
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
# Install only production dependencies for a lighter image
RUN npm ci --only=production
# Run as a non-root user for security (Best Practice)
#USER node
EXPOSE 3000
CMD ["node", "server.js"]