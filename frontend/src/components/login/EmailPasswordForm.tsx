import React, { useState } from 'react';
import { Input } from '../../config/theme/ui/Input';
import { Button } from '../../config/theme/ui/Button';

interface EmailPasswordFormProps {
  onSubmit: (email: string, password: string, displayName?: string) => void;
  isLoading: boolean;
  submitText: string;
  showDisplayName?: boolean;
  onForgotPassword?: () => void;
}

const EmailPasswordForm: React.FC<EmailPasswordFormProps> = ({
  onSubmit,
  isLoading,
  submitText,
  showDisplayName = false,
  onForgotPassword
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (showDisplayName && !displayName) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(email, password, showDisplayName ? displayName : undefined);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {showDisplayName && (
        <div>
          <label htmlFor="displayName" className="sr-only">
            Display Name
          </label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            required={showDisplayName}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            error={errors.displayName}
          />
        </div>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          error={errors.email}
        />
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          error={errors.password}
        />
      </div>

      {!showDisplayName && onForgotPassword && (
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-[color:var(--c-primary)] hover:opacity-80 font-medium"
          >
            Forgot password?
          </button>
        </div>
      )}

      <div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Loading...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default EmailPasswordForm;
