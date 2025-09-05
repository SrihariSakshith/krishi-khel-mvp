# Use the official Node.js image.
FROM node:18-alpine

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the Vite dev server runs on
EXPOSE 3000

# Command to run the Vite development server
CMD ["npm", "run", "dev"]