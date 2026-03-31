import React from 'react';
import { cn } from './cn';
import { btnBase, btnGhost, btnPrimary } from './classes';

type Variant = 'primary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        btnBase,
        variant === 'primary' && btnPrimary,
        variant === 'ghost' && btnGhost,
        className,
      )}
      {...props}
    />
  );
};
