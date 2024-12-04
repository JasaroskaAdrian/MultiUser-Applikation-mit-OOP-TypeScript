# Use the official Node.js 18 image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Ensure a clean state for dependencies
RUN rm -rf node_modules package-lock.json && npm install --legacy-peer-deps

# Copy the entire application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose the port used by the Vite development server
EXPOSE 4200

# Command to start the application
CMD ["npm", "run", "dev"]
