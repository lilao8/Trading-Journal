import React, { useState, useEffect } from 'react';
import { Trade, TradeFormData } from './types';
import { TradeForm } from './components/TradeForm';
import { TradeList } from './components/TradeList';
import { StatsDashboard, EquityCurve } from './components/StatsDashboard';
import { Journal } from './components/Journal';
import { LayoutDashboard, History, PlusCircle, RefreshCw, TrendingUp, BookOpen, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal'>('dashboard');

  const fetchTrades = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trades');
      if (!response.ok) throw new Error('Failed to fetch trades');
      const data = await response.json();
      setTrades(data);
      setError(null);
    } catch (err) {
      setError('Could not load trade data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleAddTrade = async (formData: TradeFormData) => {
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to add trade');
      const newTrade = await response.json();
      setTrades(prev => [newTrade, ...prev]);
    } catch (err) {
      alert('Error adding trade. Please check your connection.');
    }
  };

  const handleUpdateTrade = async (id: number, formData: TradeFormData) => {
    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update trade');
      const updatedTrade = await response.json();
      setTrades(prev => prev.map(t => t.id === id ? updatedTrade : t));
      setEditingTrade(null);
    } catch (err) {
      alert('Error updating trade.');
    }
  };

  const handleDeleteTrade = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trade record?')) return;
    try {
      const response = await fetch(`/api/trades/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete trade');
      setTrades(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting trade.');
    }
  };

  const handleExportCSV = async () => {
    try {
      // Export Trades
      if (trades.length > 0) {
        const tradeHeaders = ['ID', 'Symbol', 'Asset Type', 'Side', 'Quantity', 'Entry Price', 'Exit Price', 'Fees', 'Date', 'Notes'];
        const tradeRows = trades.map(t => [
          t.id,
          t.symbol,
          t.asset_type,
          t.side,
          t.quantity,
          t.entry_price,
          t.exit_price,
          t.fees,
          t.trade_date,
          `"${(t.notes || '').replace(/"/g, '""')}"`
        ]);
        
        const csvContent = [tradeHeaders.join(','), ...tradeRows.map(r => r.join(','))].join('\n');
        downloadCSV(csvContent, `trades_backup_${new Date().toISOString().slice(0, 10)}.csv`);
      }

      // Export Reviews
      const reviewsRes = await fetch('/api/reviews');
      if (reviewsRes.ok) {
        const reviews = await reviewsRes.json();
        if (reviews.length > 0) {
          const reviewHeaders = ['ID', 'Title', 'Content', 'Date', 'Created At'];
          const reviewRows = reviews.map((r: any) => [
            r.id,
            `"${(r.title || '').replace(/"/g, '""')}"`,
            `"${(r.content || '').replace(/"/g, '""')}"`,
            r.date,
            r.created_at
          ]);
          
          const csvContent = [reviewHeaders.join(','), ...reviewRows.map(r => r.join(','))].join('\n');
          downloadCSV(csvContent, `journal_backup_${new Date().toISOString().slice(0, 10)}.csv`);
        }
      }
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please try again.');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 selection:bg-emerald-500/30">
      {/* Navigation Rail / Header */}
      <header className="bg-zinc-950 border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center rounded-sm shadow-md">
                <span className="text-zinc-950 font-serif italic font-bold">S</span>
              </div>
              <h1 className="font-serif italic text-xl font-bold tracking-tight text-white">ScalpJournal</h1>
            </div>

            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "px-4 py-2 text-[11px] uppercase font-bold tracking-widest transition-[background-color,color,transform] duration-200 rounded-md",
                  activeTab === 'dashboard' ? "bg-emerald-500 text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={cn(
                  "px-4 py-2 text-[11px] uppercase font-bold tracking-widest transition-[background-color,color,transform] duration-200 rounded-md",
                  activeTab === 'journal' ? "bg-emerald-500 text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                Thoughts
              </button>
              
              <div className="w-px h-4 bg-white/10 mx-2" />
              
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-[11px] uppercase font-bold tracking-widest text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-[background-color,color] duration-200 rounded-md"
                title="Export Data to CSV"
              >
                <Download size={14} />
                Export CSV
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchTrades}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-emerald-500"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-[11px] uppercase font-bold tracking-widest text-zinc-500">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 mb-8 flex items-center justify-between rounded-lg">
            <span>{error}</span>
            <button onClick={fetchTrades} className="underline font-bold hover:text-rose-300">Retry</button>
          </div>
        )}

        {isLoading && trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <RefreshCw size={40} className="animate-spin mb-4 text-emerald-500" />
            <p className="font-mono text-sm">Initializing dashboard...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Top Section: Stats & Form */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={20} className="text-emerald-500" />
                      <h2 className="font-serif italic text-2xl text-white">Performance Overview</h2>
                    </div>
                    <TradeForm onAdd={handleAddTrade} />
                  </div>
                  <StatsDashboard trades={trades} />
                </div>

                {/* Middle Section: History */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <History size={20} className="text-emerald-500" />
                    <h2 className="font-serif italic text-2xl text-white">Recent Executions</h2>
                  </div>
                  <TradeList trades={trades} onDelete={handleDeleteTrade} onEdit={setEditingTrade} />
                </div>

                {editingTrade && (
                  <TradeForm 
                    initialData={editingTrade} 
                    onUpdate={handleUpdateTrade} 
                    onAdd={() => {}} 
                    onClose={() => setEditingTrade(null)} 
                  />
                )}

                {/* Bottom Section: Chart */}
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={20} className="text-emerald-500" />
                    <h2 className="font-serif italic text-2xl text-white">Equity Curve</h2>
                  </div>
                  <EquityCurve trades={trades} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Journal />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/5 h-10 flex items-center px-4 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
              Status: Connected
            </span>
            <span>Database: SQLite 3</span>
          </div>
          <div>
            &copy; 2026 ScalpJournal v1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}
