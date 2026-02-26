import React, { useState, useEffect } from 'react';
import { Trade, TradeFormData } from './types';
import { TradeForm } from './components/TradeForm';
import { TradeList } from './components/TradeList';
import { StatsDashboard, EquityCurve } from './components/StatsDashboard';
import { LayoutDashboard, History, PlusCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

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

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation Rail / Header */}
      <header className="bg-white border-b border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <span className="text-white font-serif italic font-bold">S</span>
            </div>
            <h1 className="font-serif italic text-xl font-bold tracking-tight">ScalpJournal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchTrades}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <div className="h-6 w-px bg-black/10" />
            <div className="text-[11px] uppercase font-bold tracking-widest opacity-40">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 mb-8 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchTrades} className="underline font-bold">Retry</button>
          </div>
        )}

        {isLoading && trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <RefreshCw size={40} className="animate-spin mb-4" />
            <p className="font-mono text-sm">Initializing dashboard...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Top Section: Stats & Form */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LayoutDashboard size={20} />
                  <h2 className="font-serif italic text-2xl">Performance Overview</h2>
                </div>
                <TradeForm onAdd={handleAddTrade} />
              </div>
              <StatsDashboard trades={trades} />
            </div>

            {/* Middle Section: History */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <History size={20} />
                <h2 className="font-serif italic text-2xl">Recent Executions</h2>
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
                <TrendingUp size={20} />
                <h2 className="font-serif italic text-2xl">Equity Curve</h2>
              </div>
              <EquityCurve trades={trades} />
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-black h-10 flex items-center px-4 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[10px] uppercase font-bold tracking-widest opacity-40">
          <div className="flex gap-4">
            <span>Status: Connected</span>
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
