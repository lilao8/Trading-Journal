import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Trade } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePnL(trade: Trade | { quantity: number; entry_price: number; exit_price: number; fees: number; side: string; asset_type: string }) {
  const multiplier = trade.side === 'Long' ? 1 : -1;
  const assetMultiplier = trade.asset_type === 'Option' ? 100 : 1;
  const gross = (trade.exit_price - trade.entry_price) * trade.quantity * multiplier * assetMultiplier;
  return gross - trade.fees;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(value);
}

export function getCurrentESTDate(includeTime = false) {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
  }
  
  const formatter = new Intl.DateTimeFormat("en-CA", options); // en-CA gives YYYY-MM-DD
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value;
  
  const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  if (includeTime) {
    return `${dateStr}T${getPart('hour')}:${getPart('minute')}`;
  }
  return dateStr;
}

export function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
