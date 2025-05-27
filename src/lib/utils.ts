import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export sanitization functions from the dedicated module
export {
  sanitizeText as sanitizeInput,
  sanitizeHtml,
  sanitizeText,
  sanitizeSearchQuery,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeFormData,
  sanitizeJson,
} from './sanitization';
