#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  WARNING: This will completely wipe the database!${NC}"
echo -e "${YELLOW}All data will be permanently deleted.${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
fi

echo -e "${GREEN}Starting database reset...${NC}"

# Load environment variables from .env, then .env.local (local overrides).
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}Loaded environment variables from .env${NC}"
fi
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo -e "${GREEN}Loaded environment variables from .env.local${NC}"
fi
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo -e "${RED}.env or .env.local file not found!${NC}"
    exit 1
fi

# Set default values if not set
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-nestuser}
DB_NAME=${DB_NAME:-backend_db}
DB_PASSWORD=${DB_PASSWORD:-${PGPASSWORD:-}}

echo -e "${GREEN}Database configuration:${NC}"
echo -e "  Host: ${DB_HOST}"
echo -e "  Port: ${DB_PORT}"
echo -e "  User: ${DB_USER}"
echo -e "  Database: ${DB_NAME}"
echo ""

# Check if we're connecting to Docker or local PostgreSQL
if [ "$DB_HOST" = "db" ] || [ "$DB_HOST" = "localhost" ]; then
    echo -e "${GREEN}Connecting to database...${NC}"

    # Avoid interactive password prompts for psql/createdb/dropdb.
    if [ -n "$DB_PASSWORD" ]; then
        export PGPASSWORD="$DB_PASSWORD"
    elif [ ! -f "$HOME/.pgpass" ]; then
        echo -e "${RED}No DB password provided and ~/.pgpass not found.${NC}"
        echo -e "${YELLOW}Set DB_PASSWORD in .env/.env.local or create ~/.pgpass to avoid prompts.${NC}"
        exit 1
    fi
    
    # Drop and recreate database
    echo -e "${GREEN}Dropping database '${DB_NAME}'...${NC}"
    dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo -e "${YELLOW}Database '${DB_NAME}' doesn't exist or couldn't be dropped${NC}"
    
    echo -e "${GREEN}Creating fresh database '${DB_NAME}'...${NC}"
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    
    # Nuke everything and recreate schema
    echo -e "${GREEN}Nuking entire schema and recreating...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database '${DB_NAME}' has been reset successfully!${NC}"
        
        # Run migrations to recreate schema
        echo -e "${GREEN}Running migrations to recreate schema...${NC}"
        npm run migrate:run
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
            echo -e "${GREEN}Database is now clean and ready for use.${NC}"
        else
            echo -e "${RED}❌ Migrations failed!${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Failed to create database!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Unsupported DB_HOST: ${DB_HOST}${NC}"
    echo -e "${YELLOW}This script supports 'localhost' and 'db' (Docker) hosts only.${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Database reset complete!${NC}"
