import React, { useState, useMemo } from 'react';
import { Trade, AssetType, Side } from '../types';
import { calculatePnL, formatCurrency, cn } from '../lib/utils';
import { Trash2, TrendingUp, TrendingDown, Edit2, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: number) => void;
  onEdit: (trade: Trade) => void;
}

type SortKey = 'trade_date' | 'symbol' | 'asset_type' | 'side' | 'quantity' | 'entry_price' | 'exit_price' | 'pnl';

export const TradeList: React.FC<TradeListProps> = ({ trades, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'All'>('All');
  const [sideFilter, setSideFilter] = useState<Side | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'trade_date',
    direction: 'desc',
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const filteredAndSortedTrades = useMemo(() => {
    let result = [...trades];

    // Filter
    if (searchTerm) {
      result = result.filter((t) =>
        t.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      result = result.filter((t) => t.asset_type === typeFilter);
    }
    if (sideFilter !== 'All') {
      result = result.filter((t) => t.side === sideFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'pnl') {
        aValue = calculatePnL(a);
        bValue = calculatePnL(b);
      } else {
        aValue = a[sortConfig.key as keyof Trade];
        bValue = b[sortConfig.key as keyof Trade];
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [trades, searchTerm, typeFilter, sideFilter, sortConfig]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-20" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="card-brutal overflow-hidden">
      <div className="p-4 border-b border-black bg-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-serif italic text-lg">Trade History</h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-black text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black/5 w-40"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2 py-1.5 border border-black text-xs font-mono focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Option">Option</option>
            <option value="ETF">ETF</option>
          </select>

          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value as any)}
            className="px-2 py-1.5 border border-black text-xs font-mono focus:outline-none"
          >
            <option value="All">All Sides</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="p-4 data-grid-header cursor-pointer hover:bg-black/5" onClick={() => handleSort('trade_date')}>
                <div className="flex items-center gap-1">Date <SortIcon column="trade_date" /></div>
              </th>
              <th className="p-4 data-grid-header cursor-pointer hover:bg-black/5" onClick={() => handleSort('symbol')}>
                <div className="flex items-center gap-1">Symbol <SortIcon column="symbol" /></div>
              </th>
              <th className="p-4 data-grid-header cursor-pointer hover:bg-black/5" onClick={() => handleSort('asset_type')}>
                <div className="flex items-center gap-1">Type <SortIcon column="asset_type" /></div>
              </th>
              <th className="p-4 data-grid-header cursor-pointer hover:bg-black/5" onClick={() => handleSort('side')}>
                <div className="flex items-center gap-1">Side <SortIcon column="side" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-black/5" onClick={() => handleSort('quantity')}>
                <div className="flex items-center justify-end gap-1">Qty <SortIcon column="quantity" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-black/5" onClick={() => handleSort('entry_price')}>
                <div className="flex items-center justify-end gap-1">Entry <SortIcon column="entry_price" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-black/5" onClick={() => handleSort('exit_price')}>
                <div className="flex items-center justify-end gap-1">Exit <SortIcon column="exit_price" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-black/5" onClick={() => handleSort('pnl')}>
                <div className="flex items-center justify-end gap-1">PnL <SortIcon column="pnl" /></div>
              </th>
              <th className="p-4 data-grid-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {filteredAndSortedTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center opacity-40 italic">
                  {trades.length === 0 ? "No trades recorded yet." : "No trades match your filters."}
                </td>
              </tr>
            ) : (
              filteredAndSortedTrades.map((trade) => {
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

