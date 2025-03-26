FROM node:20-alpine

WORKDIR /app

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run next:build

# Start the application
CMD ["npm", "run", "next:start"]