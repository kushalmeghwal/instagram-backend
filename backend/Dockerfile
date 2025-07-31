# Use node base image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose backend port
EXPOSE 5000
RUN npm install -g tsx

# Start the server
CMD ["npm", "run", "dev"]
