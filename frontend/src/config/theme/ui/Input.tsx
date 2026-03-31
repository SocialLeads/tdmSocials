import React from 'react';
import { cn } from './cn';
import { inputBase } from './classes';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input: React.FC<InputProps> = ({ className, error, ...props }) => {
  return (
    <div>
      <input
        className={cn(inputBase, error && 'border-[color:var(--c-error)]', className)}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[color:var(--c-error)]">{error}</p>}
    </div>
  );
};
