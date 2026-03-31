# NestJS Backend Skeleton

A production-ready NestJS backend skeleton with PostgreSQL, Redis, BullMQ, and JWT authentication. This is a comprehensive base template for building scalable SaaS applications.

## 🚀 Features

- **NestJS Framework** - Modern, scalable Node.js framework
- **TypeScript** - Full type safety and modern JavaScript features
- **PostgreSQL** - Robust relational database with TypeORM
- **Redis** - High-performance caching and session storage
- **BullMQ** - Background job processing with Redis
- **JWT Authentication** - Secure token-based authentication
- **Docker Support** - Containerized development and deployment
- **Swagger Documentation** - Auto-generated API documentation
- **Role-Based Access Control** - Admin and User roles
- **Comprehensive Error Handling** - Custom exception filters
- **Request Throttling** - Rate limiting protection
- **Database Seeding** - Sample data for development
- **AI Integration Ready** - OpenAI API service included
- **Firebase Authentication** - Firebase ID token exchange for JWT tokens

## 📁 Project Structure

```
src/
├── app.module.ts                 # Main application module
├── main.ts                      # Application bootstrap
├── config/                      # Configuration files
│   ├── app.config.ts           # Application configuration
│   └── database.config.ts      # Database configuration
├── modules/                     # Feature modules
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts  # Auth endpoints
│   │   ├── auth.service.ts     # Auth business logic
│   │   ├── auth.module.ts      # Auth module definition
│   │   ├── jwt.strategy.ts     # JWT passport strategy
│   │   └── guards/             # Authentication guards
│   ├── users/                  # User management module
│   │   ├── users.entity.ts     # User database entity
│   │   ├── users.service.ts    # User business logic
│   │   ├── users.controller.ts # User endpoints
│   │   └── users.repository.ts # User data access
│   ├── queue/                  # Background job processing
│   │   ├── queue.service.ts    # Queue management
│   │   └── queue.module.ts     # Queue module
│   └── ai-integration/         # AI services
│       └── openai-api.service.ts # OpenAI integration
├── shared/                     # Shared utilities
│   ├── exceptions/             # Custom exceptions
│   ├── filters/                # Exception filters
│   ├── interfaces/             # TypeScript interfaces
│   └── middleware/             # Custom middleware
├── utils/                      # Utility functions
│   ├── database.utils.ts       # Database utilities
│   ├── swagger.utils.ts        # Swagger configuration
│   └── seeder.ts              # Database seeding
└── clients/                    # External service clients
    └── axios.service.ts        # HTTP client service
```

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15
- **ORM**: TypeORM 0.3.x
- **Cache/Queue**: Redis 7 with BullMQ
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Validation**: Class Validator & Class Transformer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd base-backend
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=backend-api

# Database
DB_HOST=db
DB_PORT=5432
DB_USER=nestuser
DB_PASSWORD=nestpassword
DB_NAME=backend_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_EXPIRY=15d

# CORS
FRONTEND_DOMAIN=http://localhost:3000

# AI Integration (Optional)
OPENAI_API_KEY=your-openai-api-key

# Firebase Configuration (Required for Firebase Auth)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
# Firebase Service Account Key (JSON string) - Optional, can use default credentials
FIREBASE_SERVICE_ACCOUNT_KEY=
```

### 3. Choose Your Setup Method

## 🐳 **Option A: Docker Setup (Recommended for New Users)**

```bash
# Copy environment file
cp .env.example .env

# Build and start everything
docker compose up --build
```

**What happens automatically:**
- ✅ PostgreSQL database starts and initializes
- ✅ Redis cache starts
- ✅ Backend builds and starts
- ✅ Database `backend_db` is created automatically
- ✅ All services connect and work together

**View Logs:**
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f redis
```

## 💻 **Option B: Local Development Setup**

### **Docker Services + Local Backend**
```bash
# Start just the database and Redis in Docker
docker compose up -d db redis

# Run the setup script (handles migrations & seeding)
./setup-db.sh

# Start the backend locally
npm run start:local
```

### **Full Local Setup**
```bash
# Install dependencies
npm install

# Start local PostgreSQL and Redis
# (You'll need to have these installed locally)

# Run setup script
./setup-db.sh

# Start development server
npm run start:dev
```

## 🔧 **Environment Files Explained**

- **`.env`** - Main environment file (used by Docker and `start:dev`)
- **`.env.local`** - Local overrides (used by `start:local`)
- **`.env.example`** - Template file for new users

### **Local Development Overrides**
Create `.env.local` to override specific settings:
```env
# Database Configuration - localhost to hit docker DB
DB_HOST=localhost
DB_PORT=5432
# Redis Configuration - localhost to hit docker REDIS
REDIS_HOST=localhost
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

## 🔐 Authentication

The application uses JWT-based authentication with the following endpoints:

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}
```

### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using Authenticated Endpoints
```http
GET /users/profile
Authorization: Bearer <your-access-token>
```

## 🔥 Firebase Authentication

The application supports Firebase authentication through token exchange. This allows frontend applications to authenticate users via Firebase and exchange Firebase ID tokens for backend JWT tokens.

### Firebase Token Exchange

```http
POST /auth/exchange-firebase-token
Content-Type: application/json

{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN..."
}
```

### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER",
  "firebaseUser": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg",
    "emailVerified": true
  }
}
```

### Frontend Integration Flow

1. **Frontend**: User signs in with Firebase (Google, email/password, etc.)
2. **Frontend**: Get Firebase ID token using `firebase.auth().currentUser.getIdToken()`
3. **Frontend**: Send Firebase token to backend `/auth/exchange-firebase-token`
4. **Backend**: Verifies Firebase token and issues backend JWT tokens
5. **Frontend**: Use backend JWT tokens for authenticated API calls

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and configure your preferred sign-in methods
3. Generate a service account key (optional - can use default credentials)
4. Add Firebase configuration to your `.env` file
5. The backend will automatically verify Firebase tokens and issue JWT tokens

### Testing Firebase Authentication

#### Quick Test with Python Server

1. **Start a local web server** to serve the test HTML file:
   ```bash
   # In your project root directory
   python3 -m http.server 8000
   ```

2. **Open the test page** in your browser:
   ```
   http://localhost:8000/tests/test-firebase-real.html
   ```

3. **Sign in with Firebase**:
   - Click "Sign in with Google" (recommended)
   - Or click "Sign in with Email" and enter credentials

4. **Get Firebase token**:
   - Click "Get Firebase Token"
   - **Open browser console** (F12) to see the full token logged
   - Copy the token from the console

5. **Test backend exchange**:
   - Click "Test Backend Exchange" button
   - Or use curl with your token:
   ```bash
   curl -X POST http://localhost:3000/auth/exchange-firebase-token \
     -H "Content-Type: application/json" \
     -d '{"firebaseToken":"YOUR_FIREBASE_TOKEN_HERE"}'
   ```

#### Expected Results

✅ **Successful exchange should return**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER",
  "firebaseUser": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "User Name",
    "photoURL": "https://example.com/photo.jpg",
    "emailVerified": true
  }
}
```

### 🔑 Development JWT Token Generation

For testing admin endpoints without Firebase authentication, use the JWT generation script:

```bash
# Generate JWT token for admin user
npm run jwt admin@admin.com ADMIN
```

This will output a JWT token that you can use with curl:

```bash
# Example: Test admin endpoint
curl -X POST http://localhost:3000/admin/sync-products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Note**: This script uses the same JWT secret as your application, so tokens generated this way will work with your existing JWT strategy.

#### Troubleshooting

- **"Unauthorized domain" error**: Add `localhost` to Firebase Console → Authentication → Settings → Authorized domains
- **Token not copying**: Check browser console (F12) for the full token
- **Backend not responding**: Ensure backend is running on port 3000

## 👥 User Roles

- **ADMIN**: Full access to all resources
- **USER**: Standard user access

## 🗄️ Database Management

### Complete Development Reset
```bash
# One-command reset: database + admin user + product sync
npm run dev-reset local
```

This script will:
1. Reset the database (drops all tables and recreates)
2. Create admin user (`admin@admin.com`)
3. Generate JWT token for testing
4. Sync products from Stripe (if app is running)

### Manual Reset Steps
```bash
# Complete database reset (WARNING: Deletes all data) (Local for if you running backend locally and DB in docker)
npm run db:reset

# Create admin user
npm run create-admin

# Generate JWT token
npm run jwt admin@admin.com ADMIN
```

### Run Migrations
```bash
npm run migrate:run
```



## 🔄 Background Jobs

The application includes BullMQ for background job processing:

```typescript
// Example: Adding a job to the queue
await this.queueService.addJobToQueue(
  'your-queue-name',
  'process-data',
  { userId: 1, data: 'example' }
);
```

## 🤖 AI Integration

OpenAI integration is ready to use:

```typescript
// Example: Generate text completion
const result = await this.openAiService.generateCompletion(
  'You are a helpful assistant',
  'Explain quantum computing',
  { maxTokens: 500, temperature: 0.7 }
);
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (WARNING: Deletes data)
docker-compose down -v
```

## 🧪 Development Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:local        # Start with local environment

# Building
npm run build              # Build for production
npm run start              # Start production build

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Database
npm run typeorm            # TypeORM CLI
npm run migrate:run        # Run migrations
npm run db:seed:data       # Seed database
npm run db:reset           # Reset database
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `db` (Docker) / `localhost` (local) |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `nestuser` |
| `DB_PASSWORD` | Database password | `nestpassword` |
| `DB_NAME` | Database name | `backend_db` |
| `REDIS_HOST` | Redis host | `redis` (Docker) / `localhost` (local) |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | `superSecret123` |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry | `30m` |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry | `15d` |

### Configuration Files

- **`src/config/app.config.ts`**: Application-wide configuration
- **`src/config/database.config.ts`**: Database connection settings

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Request Throttling**: Rate limiting protection
- **CORS Configuration**: Configurable cross-origin policies
- **Input Validation**: Class-validator for request validation
- **Role-Based Access**: Admin/User role system
- **Exception Filters**: Centralized error handling

## 📝 Error Handling

The application includes comprehensive error handling with custom exception filters:

- **AuthExceptionFilter**: Authentication errors
- **ValidationExceptionFilter**: Input validation errors
- **DatabaseExceptionFilter**: Database operation errors
- **EntityNotFoundExceptionFilter**: Entity not found errors

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Docker Production

```bash
# Build production image
docker build -t your-app:latest .

# Run production container
docker run -p 3000:3000 --env-file .env your-app:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [Issues](../../issues) page
- Review the API documentation at `/api`
- Check the logs: `docker-compose logs -f backend`

---

**Happy Coding! 🎉**