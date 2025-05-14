FROM node:18.10.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies and required packages for MongoDB Atlas connectivity
RUN apk add --no-cache ca-certificates

# Copy package files
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
