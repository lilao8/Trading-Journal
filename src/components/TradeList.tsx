import React, { useState, useMemo, useEffect } from 'react';
import { Trade, AssetType, Side } from '../types';
import { calculatePnL, formatCurrency, cn } from '../lib/utils';
import { Trash2, TrendingUp, TrendingDown, Edit2, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, Clock } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, isThisYear, parseISO } from 'date-fns';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: number) => void;
  onEdit: (trade: Trade) => void;
}

type SortKey = 'trade_date' | 'symbol' | 'asset_type' | 'side' | 'quantity' | 'entry_price' | 'exit_price' | 'pnl';
type TimeRange = 'Today' | 'Week' | 'Month' | 'Year' | 'All';

export const TradeList: React.FC<TradeListProps> = React.memo(({ trades, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'All'>('All');
  const [sideFilter, setSideFilter] = useState<Side | 'All'>('All');
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');
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

    // Time Range Filter
    if (timeRange !== 'All') {
      result = result.filter((t) => {
        const date = parseISO(t.trade_date);
        if (timeRange === 'Today') return isToday(date);
        if (timeRange === 'Week') return isThisWeek(date, { weekStartsOn: 1 });
        if (timeRange === 'Month') return isThisMonth(date);
        if (timeRange === 'Year') return isThisYear(date);
        return true;
      });
    }

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
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-serif text-lg text-white">Trade History</h3>
          <div className="flex bg-zinc-900/80 p-0.5 rounded-lg border border-white/5">
            {(['Today', 'Week', 'Month', 'Year', 'All'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                  timeRange === range 
                    ? "bg-emerald-500 text-zinc-950 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-zinc-900/50 border border-white/10 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-40 rounded-md text-zinc-100"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2 py-1.5 bg-zinc-900/50 border border-white/10 text-xs font-mono focus:outline-none rounded-md text-zinc-300"
          >
            <option value="All">All Types</option>
            <option value="Option">Option</option>
            <option value="ETF">ETF</option>
          </select>

          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value as any)}
            className="px-2 py-1.5 bg-zinc-900/50 border border-white/10 text-xs font-mono focus:outline-none rounded-md text-zinc-300"
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
            <tr className="bg-white/5">
              <th className="p-4 data-grid-header cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('trade_date')}>
                <div className="flex items-center gap-1">Date <SortIcon column="trade_date" /></div>
              </th>
              <th className="p-4 data-grid-header cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('symbol')}>
                <div className="flex items-center gap-1">Symbol <SortIcon column="symbol" /></div>
              </th>
              <th className="p-4 data-grid-header cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('asset_type')}>
                <div className="flex items-center gap-1">Type <SortIcon column="asset_type" /></div>
              </th>
              <th className="p-4 data-grid-header cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('side')}>
                <div className="flex items-center gap-1">Side <SortIcon column="side" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('quantity')}>
                <div className="flex items-center justify-end gap-1">Qty <SortIcon column="quantity" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('entry_price')}>
                <div className="flex items-center justify-end gap-1">Entry <SortIcon column="entry_price" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('exit_price')}>
                <div className="flex items-center justify-end gap-1">Exit <SortIcon column="exit_price" /></div>
              </th>
              <th className="p-4 data-grid-header text-right cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSort('pnl')}>
                <div className="flex items-center justify-end gap-1">PnL <SortIcon column="pnl" /></div>
              </th>
              <th className="p-4 data-grid-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAndSortedTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-zinc-500">
                  {trades.length === 0 ? "No trades recorded yet." : "No trades match your filters."}
                </td>
              </tr>
            ) : (
              filteredAndSortedTrades.map((trade) => {
                const pnl = calculatePnL(trade);
                const isProfit = pnl >= 0;

                return (
                  <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-xs font-mono text-zinc-500">
                      {format(new Date(trade.trade_date), 'MM/dd HH:mm')}
                    </td>
                    <td className="p-4 font-bold tracking-tight text-zinc-100">
                      {trade.symbol}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] px-1.5 py-0.5 border border-white/10 rounded uppercase font-bold text-zinc-500">
                        {trade.asset_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                        trade.side === 'Long' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 text-right data-value text-zinc-300">
                      {trade.quantity}
                    </td>
                    <td className="p-4 text-right data-value text-zinc-300">
                      {formatCurrency(trade.entry_price)}
                    </td>
                    <td className="p-4 text-right data-value text-zinc-300">
                      {formatCurrency(trade.exit_price)}
                    </td>
                    <td className={cn(
                      "p-4 text-right data-value font-bold",
                      isProfit ? "text-emerald-400" : "text-rose-400"
                    )}>
                      <div className="flex items-center justify-end gap-1">
                        {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatCurrency(pnl)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => onEdit(trade)}
                          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors duration-200"
                          title="Edit Trade"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(trade.id)}
                          className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors duration-200"
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
});

