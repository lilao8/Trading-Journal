export type AssetType = 'Option' | 'ETF';
export type Side = 'Long' | 'Short';

export interface Trade {
  id: number;
  symbol: string;
  asset_type: AssetType;
  side: Side;
  quantity: number;
  entry_price: number;
  exit_price: number;
  fees: number;
  trade_date: string;
  notes: string;
}

export interface TradeFormData {
  symbol: string;
  asset_type: AssetType;
  side: Side;
  quantity: number;
  entry_price: number;
  exit_price: number;
  fees: number;
  trade_date: string;
  notes: string;
}
