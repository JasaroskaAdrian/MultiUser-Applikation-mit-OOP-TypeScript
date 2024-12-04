# Use the official Node.js 18 image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies (use --legacy-peer-deps to handle any dependency conflicts)
RUN npm install --legacy-peer-deps

# Copy the entire application code to the container
COPY . .

# Expose the port used by the Vite development server
EXPOSE 4200

# Command to start the application
CMD ["npm", "run", "dev"]
