export type CountryCode =
  | "IN"
  | "US"
  | "GB"
  | "AE"
  | "CA"
  | "AU"
  | "SG"
  | "DE"
  | "FR"
  | "JP";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: "INR" | "USD" | "GBP" | "AED" | "CAD" | "AUD" | "SGD" | "EUR" | "JPY";
  symbol: string;
}

/**
 * Checkout country configuration.
 *
 * Prices currently remain in the catalog's base currency (INR).
 * The currency metadata is intentionally centralized here so a
 * server-side pricing/exchange-rate service can be connected later
 * without changing the checkout UI.
 */
export const COUNTRIES: CountryConfig[] = [
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "د.إ" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "CA$" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
];

export function getCountry(code: CountryCode) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}
