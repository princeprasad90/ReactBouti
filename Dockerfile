# Use an official Node.js runtime as a parent image
FROM node:12-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache python2 g++ make
RUN npm install 

# Copy the rest of the application code to the container
COPY . .

# Build the production version of the application
RUN npm run build:production

# Set the command to run when the container starts
CMD ["npm","run", "start:production"]
