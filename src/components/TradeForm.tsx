import React, { useState, useEffect } from 'react';
import { AssetType, Side, TradeFormData, Trade } from '../types';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, calculatePnL, formatCurrency, getCurrentESTDate } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface TradeFormProps {
  onAdd: (trade: TradeFormData) => void;
  onUpdate?: (id: number, trade: TradeFormData) => void;
  initialData?: Trade | null;
  onClose?: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onAdd, onUpdate, initialData, onClose }) => {
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [formData, setFormData] = useState<TradeFormData>(
    initialData ? {
      symbol: initialData.symbol,
      asset_type: initialData.asset_type,
      side: initialData.side,
      quantity: initialData.quantity,
      entry_price: initialData.entry_price,
      exit_price: initialData.exit_price,
      fees: initialData.fees,
      trade_date: initialData.trade_date.slice(0, 16),
      notes: initialData.notes,
    } : {
      symbol: '',
      asset_type: 'Option',
      side: 'Long',
      quantity: 1,
      entry_price: 0,
      exit_price: 0,
      fees: 0,
      trade_date: getCurrentESTDate(true),
      notes: '',
    }
  );

  useEffect(() => {
    if (initialData) {
      setIsOpen(true);
      setFormData({
        symbol: initialData.symbol,
        asset_type: initialData.asset_type,
        side: initialData.side,
        quantity: initialData.quantity,
        entry_price: initialData.entry_price,
        exit_price: initialData.exit_price,
        fees: initialData.fees,
        trade_date: initialData.trade_date.slice(0, 16),
        notes: initialData.notes,
      });
      setAiReview(null);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData && onUpdate) {
      onUpdate(initialData.id, formData);
    } else {
      onAdd(formData);
      setIsOpen(false);
      setFormData({
        symbol: '',
        asset_type: 'Option',
        side: 'Long',
        quantity: 1,
        entry_price: 0,
        exit_price: 0,
        fees: 0,
        trade_date: getCurrentESTDate(true),
        notes: '',
      });
    }
  };

  const handleAiReview = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const pnl = calculatePnL({ ...formData, id: 0 } as Trade);
      const prompt = `你是一个顶级专业交易员，性格犀利、直言不讳。请根据以下交易数据进行深度复盘点评：
      交易品种: ${formData.symbol} (${formData.asset_type})
      方向: ${formData.side}
      盈亏: ${formatCurrency(pnl)}
      入场理由/笔记: ${formData.notes || "未填写"}
      
      请给出一段简短但深刻的点评，指出操作中的亮点或致命错误。`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });
      setAiReview(response.text);
    } catch (error) {
      console.error("AI Review failed:", error);
      setAiReview("AI 暂时掉线了，请稍后再试。");
    } finally {
      setIsAiLoading(false);
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
      [name]: ['quantity', 'entry_price', 'exit_price', 'fees'].includes(name) 
        ? parseFloat(value) || 0 
        : (name === 'symbol' ? value.toUpperCase() : value)
    }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className={cn(!initialData && "mb-8")}>
      {!initialData && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-glow flex items-center gap-2"
        >
          <Plus size={18} />
          Log New Trade
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-zinc-950/90 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="glass-card w-full max-w-2xl p-8 relative rounded-3xl overflow-hidden"
            >
              {/* Decorative Glow - Simplified */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full"></div>

              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-3xl mb-8 text-white">
                {initialData ? 'Refine Execution' : 'Log New Execution'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Symbol</label>
                    <input
                      name="symbol"
                      required
                      value={formData.symbol}
                      onChange={handleChange}
                      placeholder="e.g. SPY"
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white h-[50px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Asset Type</label>
                    <select
                      name="asset_type"
                      value={formData.asset_type}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white h-[50px]"
                    >
                      <option value="Option">Option</option>
                      <option value="ETF">ETF</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Side</label>
                    <div className="flex p-1 bg-zinc-900/50 border border-white/10 rounded-xl h-[50px]">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, side: 'Long' })}
                        className={cn(
                          "flex-1 text-xs font-bold rounded-lg transition-all",
                          formData.side === 'Long' ? "bg-emerald-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        LONG
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, side: 'Short' })}
                        className={cn(
                          "flex-1 text-xs font-bold rounded-lg transition-all",
                          formData.side === 'Short' ? "bg-rose-500 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        SHORT
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      step="any"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Entry Price</label>
                    <input
                      name="entry_price"
                      type="number"
                      step="any"
                      required
                      value={formData.entry_price}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Exit Price</label>
                    <input
                      name="exit_price"
                      type="number"
                      step="any"
                      required
                      value={formData.exit_price}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Fees</label>
                    <input
                      name="fees"
                      type="number"
                      step="any"
                      value={formData.fees}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Date & Time</label>
                  <input
                    name="trade_date"
                    type="datetime-local"
                    required
                    value={formData.trade_date}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Notes / Entry Reason</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-white/10 p-3 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white resize-none"
                    placeholder="Why did you take this trade?"
                  />
                </div>

                {aiReview && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <Sparkles size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">AI Deep Review</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      "{aiReview}"
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  {initialData && (
                    <button
                      type="button"
                      onClick={handleAiReview}
                      disabled={isAiLoading}
                      className="btn-glow-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      AI 深度复盘
                    </button>
                  )}
                  <button type="submit" className="btn-glow flex-1">
                    {initialData ? 'Update Execution' : 'Log Execution'}
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
