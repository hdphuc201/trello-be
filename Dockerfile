# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . ./
RUN npm run build

# Production Stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy only necessary files
COPY package*.json ./
RUN npm install --only=production

# Copy compiled build
COPY --from=build /app/build ./build
# COPY .env ./
# Expose port
EXPOSE 8017

# Main command
CMD ["node", "build/src/server.js"]
