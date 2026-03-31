import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import EmailPasswordForm from './EmailPasswordForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { Alert } from '../../config/theme/ui/Alert';

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleEmailPasswordLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.authenticateUser(username, password);

      // Redirect to original page or dashboard 
      const from = location.state?.from?.pathname || location.state?.returnTo || '/';
      navigate(from, { replace: true });

    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm 
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert message={error} variant="error" />
      )}
      <EmailPasswordForm 
        onSubmit={handleEmailPasswordLogin}
        isLoading={isLoading}
        submitText="Sign in"
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    </div>
  );
};

export default LoginForm;
