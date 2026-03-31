/**
 * Date utility functions for subscription and token management
 */

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get the start of the month for a given date
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the end of the month for a given date
 */
export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if a date is today or in the future
 */
export function isTodayOrFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate >= today;
}

/**
 * Format date for logging
 */
export function formatDateForLog(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get next token top-up date based on subscription frequency
 */
export function getNextTokenTopupDate(frequency: 'monthly' | 'yearly', fromDate: Date = new Date()): Date {
  if (frequency === 'yearly') {
    return addMonths(fromDate, 1); // For yearly subs, give monthly token allocations
  } else {
    return addMonths(fromDate, 1); // For monthly subs, also monthly (but this won't be used)
  }
}
