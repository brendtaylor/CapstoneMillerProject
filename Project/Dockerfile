# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./api/package*.json ./

# Install app dependencies inside the container
RUN npm install

# Copy the rest of your app's source code
COPY ./api/ ./

# Make your app's port (3000) available to the outside world
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "index.js" ]