# new-nodejs-backend/Dockerfile
# Use the official Node.js image as a base
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port the Node.js app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]