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
  onSubmit, isLoading, submitText, showDisplayName = false, onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) { newErrors.email = 'E-mail is verplicht'; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Ongeldig e-mailadres'; }
    if (!password) { newErrors.password = 'Wachtwoord is verplicht'; }
    else if (password.length < 6) { newErrors.password = 'Wachtwoord moet minimaal 6 tekens bevatten'; }
    if (showDisplayName && !displayName) { newErrors.displayName = 'Weergavenaam is verplicht'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) { onSubmit(email, password, showDisplayName ? displayName : undefined); }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {showDisplayName && (
        <div>
          <label htmlFor="displayName" className="sr-only">Weergavenaam</label>
          <Input id="displayName" name="displayName" type="text" required={showDisplayName} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Weergavenaam" error={errors.displayName} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="sr-only">E-mailadres</label>
        <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mailadres" error={errors.email} />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">Wachtwoord</label>
        <Input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Wachtwoord" error={errors.password} />
      </div>
      {!showDisplayName && onForgotPassword && (
        <div className="text-right">
          <button type="button" onClick={onForgotPassword} className="text-sm text-[color:var(--c-primary)] hover:opacity-80 font-medium">Wachtwoord vergeten?</button>
        </div>
      )}
      <div>
        <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Laden...' : submitText}</Button>
      </div>
    </form>
  );
};

export default EmailPasswordForm;
