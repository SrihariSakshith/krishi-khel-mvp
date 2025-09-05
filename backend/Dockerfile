# Use a Debian-based image that includes the necessary libraries for Prisma
FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy all source code including the entrypoint script
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 5000

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# The command that the entrypoint will execute after the migration
CMD ["npm", "start"]