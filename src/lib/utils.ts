import { twMerge } from 'tailwind-merge';

type ClassInput = string | null | undefined | false;

export function cn(...inputs: ClassInput[]) {
    return twMerge(inputs.filter(Boolean).join(' '));
}
