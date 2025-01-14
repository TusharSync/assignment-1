# Base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json for dependency installation
COPY ../../package*.json ./

# Install dependencies
RUN npm install --production

# Copy built API code to the container
COPY ../../dist/api ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose the API port
EXPOSE 3000

# Run the API server
CMD ["node", "dist/main.js"]
