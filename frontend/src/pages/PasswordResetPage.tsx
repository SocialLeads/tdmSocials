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
      if (!token) { setIsValid(false); setIsValidating(false); setError('Resetlink bevat geen token.'); return; }
      try {
        setError(null);
        const response = await authApi.validateResetToken(token);
        setIsValid(Boolean(response?.valid));
      } catch (err: any) {
        setIsValid(false);
        setError(err?.response?.data?.message || 'Resetlink is ongeldig of verlopen.');
      } finally { setIsValidating(false); }
    };
    validateToken();
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { setError('Vul je nieuwe wachtwoord in en bevestig het.'); return; }
    if (newPassword.length < 6) { setError('Wachtwoord moet minimaal 6 tekens bevatten.'); return; }
    if (newPassword !== confirmPassword) { setError('Wachtwoorden komen niet overeen.'); return; }
    try {
      setIsSubmitting(true); setError(null);
      await authApi.resetPassword(token || '', newPassword);
      setSuccess('Wachtwoord bijgewerkt. Je kunt nu inloggen.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Wachtwoord resetten mislukt. Probeer het opnieuw.');
    } finally { setIsSubmitting(false); }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('E-mail is verplicht om de resetlink opnieuw te versturen.'); return; }
    try {
      setIsSubmitting(true); setError(null);
      await authApi.requestPasswordReset(email);
      setSuccess('Resetlink verzonden. Controleer je e-mail.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Resetlink opnieuw versturen mislukt.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--c-bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="block">
            <div className="mx-auto h-12 w-12 bg-[color:var(--c-primary)] rounded-lg flex items-center justify-center hover:opacity-90 transition-colors">
              <span className="text-white font-bold text-xl">{config.app.name.charAt(0)}</span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[color:var(--c-text)]">Wachtwoord resetten</h2>
          <p className="mt-2 text-center text-sm text-[color:var(--c-text2)]">Voer een nieuw wachtwoord in voor je account.</p>
        </div>

        {isValidating && (<div className="text-center text-sm text-[color:var(--c-text2)]">Resetlink valideren...</div>)}
        {!isValidating && error && <Alert message={error} variant="error" />}
        {!isValidating && success && <Alert message={success} variant="success" />}

        {!isValidating && isValid && (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="newPassword" className="sr-only">Nieuw wachtwoord</label>
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nieuw wachtwoord" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Wachtwoord bevestigen</label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Wachtwoord bevestigen" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Bijwerken...' : 'Wachtwoord bijwerken'}</Button>
          </form>
        )}

        {!isValidating && !isValid && (
          <form className="space-y-4" onSubmit={handleResend}>
            <div className="text-sm text-[color:var(--c-text2)]">Nieuwe resetlink nodig? Voer je e-mail in en we sturen er een.</div>
            <div>
              <label htmlFor="email" className="sr-only">E-mailadres</label>
              <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mailadres" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Verzenden...' : 'Resetlink opnieuw versturen'}</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
