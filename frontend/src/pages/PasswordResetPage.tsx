import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAppConfig } from '../contexts/ThemeContext';
import { Alert } from '../config/theme/ui/Alert';
import { Input } from '../config/theme/ui/Input';
import { Button } from '../config/theme/ui/Button';

const PasswordResetPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const config = useAppConfig();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        setIsValidating(false);
        setError('Reset link is missing a token.');
        return;
      }

      try {
        setError(null);
        const response = await authApi.validateResetToken(token);
        setIsValid(Boolean(response?.valid));
      } catch (err: any) {
        setIsValid(false);
        setError(err?.response?.data?.message || 'Reset link is invalid or expired.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await authApi.resetPassword(token || '', newPassword);
      setSuccess('Password updated. You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required to resend the reset link.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await authApi.requestPasswordReset(email);
      setSuccess('Reset link sent. Please check your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
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
              <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
                <span className="text-white font-bold text-xl">
                  {config.app.name.charAt(0)}
                </span>
              </div>
            )}
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter a new password for your account.
          </p>
        </div>

        {isValidating && (
          <div className="text-center text-sm text-text-secondary">Validating reset link...</div>
        )}

        {!isValidating && error && (
          <Alert message={error} variant="error" />
        )}

        {!isValidating && success && (
          <Alert message={success} variant="success" />
        )}

        {!isValidating && isValid && (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="newPassword" className="sr-only">
                New password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}

        {!isValidating && !isValid && (
          <form className="space-y-4" onSubmit={handleResend}>
            <div className="text-sm text-text-secondary">
              Need a new reset link? Enter your email and we will resend it.
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Sending...' : 'Resend reset link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
