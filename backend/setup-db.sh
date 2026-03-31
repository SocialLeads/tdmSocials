#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting database setup...${NC}"

# Start Docker containers (DB and Redis)
echo -e "${GREEN}Starting Docker containers (DB and Redis)...${NC}"
docker compose up -d db redis

# Wait for containers to be healthy
echo -e "${GREEN}Waiting for containers to be ready...${NC}"
sleep 10

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install
fi

# Run migrations with local environment (connects to Docker DB)
echo -e "${GREEN}Running migrations...${NC}"
npx cross-env NODE_ENV=local npm run migrate:run

# Seed the database
echo -e "${GREEN}Seeding database...${NC}"
npx cross-env NODE_ENV=local npm run db:seed:data

echo -e "${GREEN}Database setup complete!${NC}"
echo -e "Docker containers are running and database is ready."
echo -e "You can now run: ${GREEN}npm run start:local${NC}"