FROM node:20-alpine

WORKDIR /app

# Copy package files for backend
COPY package*.json ./
COPY prisma ./prisma/

# Install backend dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy all source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Build backend TypeScript
WORKDIR /app
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]
