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
