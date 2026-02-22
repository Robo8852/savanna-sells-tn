/**
 * Format a number as a USD price string.
 * Example: 1200000 → "$1,200,000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
