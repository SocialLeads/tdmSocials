import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useAppConfig } from '../contexts/ThemeContext';
import LoginForm from '../components/login/LoginForm';
import SignUpForm from '../components/login/SignUpForm';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const config = useAppConfig();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || location.state?.returnTo || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--c-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="block">
            {config.app.logo ? (
              <img 
                src={config.app.logo} 
                alt={config.app.name}
                className="mx-auto h-12 w-12 rounded-lg"
              />
            ) : (
              <div className="mx-auto h-12 w-12 bg-[color:var(--c-primary)] rounded-lg flex items-center justify-center hover:opacity-90 transition-colors">
                <span className="text-[color:var(--c-bg)] font-bold text-xl">
                  {config.app.name.charAt(0)}
                </span>
              </div>
            )}
          </Link>
          
          {/* Show redirect message if present */}
          {location.state?.message && (
            <div className="mt-4 p-3 bg-[color:var(--c-surface)] border border-[color:var(--c-border)] rounded-md">
              <p className="text-sm text-[color:var(--c-text)] text-center">
                {location.state.message}
              </p>
            </div>
          )}
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[color:var(--c-text)]">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-[color:var(--c-text2)]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-[color:var(--c-primary)] hover:opacity-80"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {isSignUp ? <SignUpForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
