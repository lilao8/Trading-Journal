import React, { useState } from 'react';
import { AssetType, Side, TradeFormData, Trade } from '../types';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TradeFormProps {
  onAdd: (trade: TradeFormData) => void;
  onUpdate?: (id: number, trade: TradeFormData) => void;
  initialData?: Trade;
  onClose?: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onAdd, onUpdate, initialData, onClose }) => {
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [formData, setFormData] = useState<TradeFormData>(initialData ? {
    symbol: initialData.symbol,
    asset_type: initialData.asset_type,
    side: initialData.side,
    quantity: initialData.quantity,
    entry_price: initialData.entry_price,
    exit_price: initialData.exit_price,
    fees: initialData.fees,
    trade_date: initialData.trade_date,
    notes: initialData.notes,
  } : {
    symbol: '',
    asset_type: 'Option',
    side: 'Long',
    quantity: 1,
    entry_price: 0,
    exit_price: 0,
    fees: 0,
    trade_date: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData && onUpdate) {
      onUpdate(initialData.id, formData);
    } else {
      onAdd(formData);
    }
    
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
      // Reset form
      setFormData({
        symbol: '',
        asset_type: 'Option',
        side: 'Long',
        quantity: 1,
        entry_price: 0,
        exit_price: 0,
        fees: 0,
        trade_date: new Date().toISOString().slice(0, 16),
        notes: '',
      });
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['quantity', 'entry_price', 'exit_price', 'fees'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className={cn(!initialData && "mb-8")}>
      {!initialData && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-brutal flex items-center gap-2"
        >
          <Plus size={18} />
          Log New Trade
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-brutal w-full max-w-2xl p-6 relative"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif italic text-2xl mb-6">
                {initialData ? 'Edit Trade Details' : 'Log Trade Details'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Symbol</label>
                  <input
                    required
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleChange}
                    placeholder="e.g. SPY, TSLA Option"
                    className="w-full border border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Asset Type</label>
                  <select
                    name="asset_type"
                    value={formData.asset_type}
                    onChange={handleChange}
                    className="w-full border border-black p-2 font-mono focus:outline-none"
                  >
                    <option value="Option">Option</option>
                    <option value="ETF">ETF</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Side</label>
                  <div className="flex gap-2">
                    {(['Long', 'Short'] as Side[]).map(side => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, side }))}
                        className={cn(
                          "flex-1 py-2 border border-black font-mono transition-colors",
                          formData.side === side ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                        )}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border border-black p-2 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Entry Price</label>
                  <input
                    type="number"
                    step="any"
                    name="entry_price"
                    value={formData.entry_price}
                    onChange={handleChange}
                    className="w-full border border-black p-2 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Exit Price</label>
                  <input
                    type="number"
                    step="any"
                    name="exit_price"
                    value={formData.exit_price}
                    onChange={handleChange}
                    className="w-full border border-black p-2 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Fees</label>
                  <input
                    type="number"
                    step="any"
                    name="fees"
                    value={formData.fees}
                    onChange={handleChange}
                    className="w-full border border-black p-2 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="trade_date"
                    value={formData.trade_date}
                    onChange={handleChange}
                    className="w-full border border-black p-2 font-mono focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-black p-2 font-mono focus:outline-none resize-none"
                    placeholder="Scalp strategy, market conditions..."
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="btn-brutal w-full text-lg py-3">
                    {initialData ? 'Update Trade Entry' : 'Confirm Trade Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
