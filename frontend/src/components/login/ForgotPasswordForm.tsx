import React, { useState } from 'react';
import { authApi } from '../../api/auth.api';
import { Alert } from '../../config/theme/ui/Alert';
import { Button } from '../../config/theme/ui/Button';
import { Input } from '../../config/theme/ui/Input';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await authApi.requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="bg-[color:var(--c-surface)] border border-[color:var(--c-success)] text-[color:var(--c-success)] px-4 py-3 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[color:var(--c-success)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-[color:var(--c-success)]">
                Reset email sent!
              </h3>
              <div className="mt-2 text-sm text-[color:var(--c-text2)]">
                <p>
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your email and follow the instructions to reset your password.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-[color:var(--c-primary)] hover:opacity-80 font-medium"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[color:var(--c-text)]">Reset your password</h3>
        <p className="mt-1 text-sm text-[color:var(--c-text2)]">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert message={error} variant="error" />
        )}

        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
