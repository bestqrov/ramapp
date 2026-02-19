FROM node:20-alpine

WORKDIR /app

# Copy package files for backend
COPY package*.json ./
COPY prisma ./prisma/

# Install backend dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy backend source code
COPY src ./src
COPY tsconfig.json ./

# Build backend TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]
