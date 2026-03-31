import React from 'react';
import { cn } from './cn';
import { alertBase, alertError, alertInfo, alertSuccess } from './classes';

type Variant = 'success' | 'error' | 'info';

interface AlertProps {
  message: string;
  variant?: Variant;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ message, variant = 'info', className }) => {
  return (
    <div
      className={cn(
        alertBase,
        variant === 'success' && alertSuccess,
        variant === 'error' && alertError,
        variant === 'info' && alertInfo,
        className,
      )}
    >
      {message}
    </div>
  );
};
