import * as React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline';
}

const variantClass = {
    default: 'border-transparent bg-slate-900 text-white',
    secondary: 'border-transparent bg-slate-100 text-slate-900',
    outline: 'text-slate-900 border border-slate-300',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                variantClass[variant],
                className,
            )}
            {...props}
        />
    );
}

export { Badge };
