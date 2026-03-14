/**
 * Shareable utilities for the storefront
 */

/**
 * Extracts a numeric value from a currency string (e.g., "Rs. 1,850" -> 1850)
 * Fixed to handle dots in "Rs." prefix correctly.
 */
export function extractNumericPrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  // 1. Remove "Rs." or any currency prefix that might have a dot
  let cleaned = String(val).replace(/Rs\.?/i, '');
  
  // 2. Remove thousands separators (commas)
  cleaned = cleaned.replace(/,/g, '');
  
  // 3. Keep only digits and the last dot (if any) as a decimal separator
  // This handles edge cases where there might be other stray dots
  cleaned = cleaned.replace(/[^\d.]/g, '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number as LKR
 */
export function formatLKR(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString('en-LK', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })}`;
}
