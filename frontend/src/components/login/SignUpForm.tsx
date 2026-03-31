import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import EmailPasswordForm from './EmailPasswordForm';
import { Alert } from '../../config/theme/ui/Alert';

const SignUpForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailPasswordSignUp = async (email: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.registerUser(email, password, displayName);

      const from = location.state?.from?.pathname || location.state?.returnTo || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert message={error} variant="error" />}
      <EmailPasswordForm
        onSubmit={handleEmailPasswordSignUp}
        isLoading={isLoading}
        submitText="Sign up"
        showDisplayName={true}
      />
    </div>
  );
};

export default SignUpForm;
