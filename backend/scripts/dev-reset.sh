#!/bin/bash

# 🚀 Complete Development Reset Script
# This script resets the database, creates an admin user, and syncs products
# Usage: ./scripts/dev-reset.sh [NODE_ENV]
# Example: ./scripts/dev-reset.sh local

NODE_ENV=${1:-local}

echo "🔄 Starting complete development reset with NODE_ENV=$NODE_ENV..."

# Step 1: Reset database using Docker
echo "📊 Resetting database..."
PGPASSWORD=nestpassword docker-compose exec -T db psql -U nestuser -d backend_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Step 2: Kill any existing process on port 3000
echo "🛑 Killing any existing process on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"

# Step 3: Start app to create tables via synchronize
echo "🚀 Starting app to create tables..."
NODE_ENV=$NODE_ENV npm run start:local &
APP_PID=$!

# Wait for app to start and create tables
echo "⏳ Waiting for app to start and create tables..."
sleep 10

# Check if app is ready by testing the health endpoint
echo "🔍 Checking if app is ready..."
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ App is ready!"
        break
    else
        echo "⏳ Waiting for app... (attempt $i/10)"
        sleep 2
    fi
done

# Step 4: Create admin user
echo "👤 Creating admin user (admin@admin.com)..."
NODE_ENV=$NODE_ENV npm run create-admin

# Verify admin user was created
if [ $? -ne 0 ]; then
    echo "❌ Failed to create admin user"
    kill $APP_PID 2>/dev/null
    exit 1
fi

# Step 5: Generate JWT token for admin
echo "🔑 Generating JWT token for admin user..."
JWT_TOKEN=$(NODE_ENV=$NODE_ENV npm run jwt admin@admin.com ADMIN 2>/dev/null | grep "ey" | head -1)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Failed to generate JWT token"
    exit 1
fi

echo "✅ JWT Token generated: ${JWT_TOKEN:0:50}..."

# Step 6: Wait for app to be ready and sync products


# Check if app is still running
if ! kill -0 $APP_PID 2>/dev/null; then
    echo "❌ App is not running, cannot sync products"
    echo "   Start your app manually and sync products with:"
    echo "   curl -X POST http://localhost:3000/admin/sync-products \\"
    echo "     -H \"Authorization: Bearer $JWT_TOKEN\""
    exit 1
fi

# Step 7: Sync products
echo "🛍️ Syncing products from Stripe..."
SYNC_RESPONSE=$(curl -X POST http://localhost:3000/admin/sync-products \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  --silent --show-error --write-out "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo $SYNC_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
    echo "✅ Products synced successfully!"
else
    echo "⚠️ Product sync failed (HTTP $HTTP_STATUS)"
    echo "   Response: $SYNC_RESPONSE"
    echo "   You can manually sync later with:"
    echo "   curl -X POST http://localhost:3000/admin/sync-products \\"
    echo "     -H \"Authorization: Bearer $JWT_TOKEN\""
fi

# Step 8: Clean up - stop the app
echo "🛑 Stopping app..."
kill $APP_PID 2>/dev/null
sleep 2

echo ""
echo "🎉 Development reset complete!"
echo "📋 Admin user: admin@admin.com"
echo "🔑 JWT Token: $JWT_TOKEN"
echo ""
echo "💡 Test admin endpoint (start your app first):"
echo "curl -X POST http://localhost:3000/admin/sync-products \\"
echo "  -H \"Authorization: Bearer $JWT_TOKEN\""
echo ""
echo "🚀 Start your app with: npm run start:dev"
