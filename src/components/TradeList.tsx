import React from 'react';
import { Trade } from '../types';
import { calculatePnL, formatCurrency, cn } from '../lib/utils';
import { Trash2, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: number) => void;
  onEdit: (trade: Trade) => void;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onDelete, onEdit }) => {
  return (
    <div className="card-brutal overflow-hidden">
      <div className="p-4 border-b border-black bg-black/5">
        <h3 className="font-serif italic text-lg">Trade History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="p-4 data-grid-header">Date</th>
              <th className="p-4 data-grid-header">Symbol</th>
              <th className="p-4 data-grid-header">Type</th>
              <th className="p-4 data-grid-header">Side</th>
              <th className="p-4 data-grid-header text-right">Qty</th>
              <th className="p-4 data-grid-header text-right">Entry</th>
              <th className="p-4 data-grid-header text-right">Exit</th>
              <th className="p-4 data-grid-header text-right">PnL</th>
              <th className="p-4 data-grid-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center opacity-40 italic">
                  No trades recorded yet.
                </td>
              </tr>
            ) : (
              trades.map((trade) => {
                const pnl = calculatePnL(trade);
                const isProfit = pnl >= 0;

                return (
                  <tr key={trade.id} className="hover:bg-black/5 transition-colors group">
                    <td className="p-4 text-xs font-mono opacity-60">
                      {format(new Date(trade.trade_date), 'MM/dd HH:mm')}
                    </td>
                    <td className="p-4 font-bold tracking-tight">
                      {trade.symbol}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] px-1.5 py-0.5 border border-black/20 rounded uppercase font-bold opacity-60">
                        {trade.asset_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                        trade.side === 'Long' ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"
                      )}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 text-right data-value">
                      {trade.quantity}
                    </td>
                    <td className="p-4 text-right data-value">
                      {formatCurrency(trade.entry_price)}
                    </td>
                    <td className="p-4 text-right data-value">
                      {formatCurrency(trade.exit_price)}
                    </td>
                    <td className={cn(
                      "p-4 text-right data-value font-bold",
                      isProfit ? "text-emerald-600" : "text-rose-600"
                    )}>
                      <div className="flex items-center justify-end gap-1">
                        {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatCurrency(pnl)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(trade)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Trade"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(trade.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Trade"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
