import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes with clsx
 * Handles conditional classes and resolves conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a string into CNIC format: XXXXX-XXXXXXX-X
 */
export function formatCNIC(value: string) {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;

    if (numbers.length > 5) {
        formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    }
    if (numbers.length > 12) {
        formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
    return formatted;
}

/**
 * Validates if a string contains exactly 13 digits
 */
export function validateCNIC(value: string) {
    if (!value) return false;
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 13;
}
