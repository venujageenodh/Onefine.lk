/**
 * Shareable utilities for the storefront
 */

/**
 * Extracts a numeric value from a currency string (e.g., "Rs. 1,850" -> 1850)
 * Uses a robust digit-first matching strategy to avoid confusion with "Rs." dots.
 */
export function extractNumericPrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  // 1. Remove commas (thousands separators)
  const s = String(val).replace(/,/g, '');
  
  // 2. Find the first numeric sequence (digits followed by an optional decimal part)
  // This automatically skips starting currency symbols/dots like "Rs."
  const match = s.match(/\d+(\.\d+)?/);
  
  if (match) {
    return parseFloat(match[0]);
  }
  
  return 0;
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
