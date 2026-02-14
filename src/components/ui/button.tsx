import * as React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'outline' | 'secondary';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClass: Record<ButtonVariant, string> = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
};

const sizeClass: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
                variantClass[variant],
                sizeClass[size],
                className,
            )}
            {...props}
        />
    );
}

export { Button };
