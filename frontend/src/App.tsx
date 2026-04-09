import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import { getAppConfig } from './config/app.config';
import { userInitializationService } from './services/user-initialization.service';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './store/slices/userSlice';
import DashboardPage from './pages/DashboardPage';
import { applyTheme } from './config/theme/applyTheme';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const appConfig = getAppConfig(process.env.REACT_APP_CONFIG as any);

  useEffect(() => {
    userInitializationService.initializeUser();
  }, []);

  useEffect(() => {
    applyTheme(appConfig.theme);
  }, [appConfig.theme]);

  return (
    <ErrorBoundary>
      <ThemeProvider config={appConfig}>
        <Provider store={store}>
          <Router basename="/admin">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/password-reset/:token" element={<PasswordResetPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute requireAuth requireRoles={[UserRole.ADMIN]}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
              </Route>
            </Routes>
          </Router>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
