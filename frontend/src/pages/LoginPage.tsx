import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import LoginForm from '../components/login/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || location.state?.returnTo || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--c-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="block">
            <img src={`${process.env.PUBLIC_URL}/tdmsocials-icon.svg`} alt="TDM Socials" className="mx-auto h-16 w-16 rounded-xl" />
          </Link>

          {location.state?.message && (
            <div className="mt-4 p-3 bg-[color:var(--c-surface)] border border-[color:var(--c-border)] rounded-md">
              <p className="text-sm text-[color:var(--c-text)] text-center">{location.state.message}</p>
            </div>
          )}

          <h2 className="mt-6 text-center text-3xl font-extrabold text-[color:var(--c-text)]">
            Inloggen
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
