import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine Tailwind classes with clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date string to a readable format
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString(
    'en-US', 
    options || defaultOptions
  );
}

// Format file size to readable format
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Safely truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}