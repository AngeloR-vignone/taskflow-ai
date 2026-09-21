import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400',
  secondary:
    'bg-white text-neutral-800 border border-line hover:bg-neutral-50 disabled:text-neutral-400',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    />
  );
}
