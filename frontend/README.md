# Base SaaS Frontend

A React frontend for micro SaaS applications with Firebase authentication and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Backend running on port 3000

### Installation
```bash
npm install
```

### Environment Setup

The app uses a two-tier environment file system:

#### 📁 Environment File Hierarchy:
1. **`.env`** - Base defaults (committed to git)
2. **`.env.local`** - Local overrides (gitignored, highest priority)

#### 🔧 Environment Loading Order:
React automatically loads environment files in this order:
1. `.env` (base defaults)
2. `.env.local` (local overrides)
3. `.env.development` (dev-specific, if exists)
4. `.env.development.local` (local dev overrides, if exists)

#### 📋 Required Environment Variables:
```bash
# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000

# Frontend Port
PORT=3001

# Firebase Configuration (add to .env.local)
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Note:** Only variables prefixed with `REACT_APP_` are exposed to the browser.

## Available Scripts

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm test`

Launches the test runner in the interactive watch mode.

## 🏗️ Architecture

### Tech Stack
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Firebase** for authentication
- **React Router** for navigation
- **Axios** for API calls

### Project Structure
```
src/
├── api/                 # API client and endpoints
│   ├── api.client.ts    # Shared Axios client
│   ├── auth.api.ts      # Authentication endpoints
│   └── users.api.ts     # User management endpoints
├── components/          # Reusable components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Navbar.tsx       # Navigation bar
│   └── UserMenu.tsx     # User dropdown menu
├── pages/               # Page components
│   ├── HomePage.tsx     # Home page
│   ├── ProfilePage.tsx  # User profile
│   └── SettingsPage.tsx # User settings
└── services/            # Business logic services
    ├── firebase.service.ts  # Firebase authentication
    └── user.service.ts      # User management
```

### Authentication Flow
1. **Firebase Login** → User authenticates with Firebase
2. **Token Exchange** → Firebase token exchanged for backend JWT
3. **API Calls** → Access token used for backend requests
4. **Auto Refresh** → Tokens automatically refreshed when needed
5. **Sign Out** → Firebase → Backend → Local cleanup

## 🔧 Development

### Testing the App
1. **Start Backend** (port 3000): `npm run start:dev`
2. **Start Frontend** (port 3001): `npm start`
3. **Open Browser**: http://localhost:3001

### Environment Variables
- Copy `.env` to `.env.local`
- Add your Firebase credentials to `.env.local`
- Only `REACT_APP_*` variables are exposed to the browser

## 📚 Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.com/)
- [Firebase Auth](https://firebase.google.com/docs/auth)
