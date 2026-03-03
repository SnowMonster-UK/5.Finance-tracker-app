import { useStore } from "@/store/useStore"

const SYMBOLS: Record<string, string> = { MNT: "₮", JPY: "¥", USD: "$" }

function getCurrencyConfig() {
  const { currency, currencyRates } = useStore.getState()
  const rate = currency === "MNT" ? 1 : currencyRates[currency] || 1
  const symbol = SYMBOLS[currency] || "₮"
  const decimals = currency === "USD" ? 2 : 0
  return { rate, symbol, decimals }
}

/**
 * Format a number as currency (converts from MNT to display currency).
 */
export function formatMNT(value: number): string {
  const { rate, symbol, decimals } = getCurrencyConfig()
  const converted = value / rate
  const abs = Math.abs(converted)
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${converted < 0 ? "-" : ""}${symbol}${formatted}`
}

/**
 * Shortened format for chart axes (converts from MNT to display currency).
 */
export function formatMNTShort(value: number): string {
  const { rate, symbol, decimals } = getCurrencyConfig()
  const converted = value / rate
  const abs = Math.abs(converted)
  const sign = converted < 0 ? "-" : ""
  if (abs >= 1_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}${symbol}${(abs / 1_000).toFixed(decimals > 0 ? 1 : 0)}K`
  }
  return `${sign}${symbol}${abs.toFixed(decimals)}`
}

/**
 * Parse a possibly formatted string to a number (in MNT).
 * If display currency is not MNT, converts back to MNT.
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/[₮¥$,\s]/g, "")
  const num = Number(cleaned)
  if (isNaN(num)) return 0
  // Convert back to MNT for storage
  const { rate } = getCurrencyConfig()
  return Math.round(num * rate)
}
