import React, { useState, useEffect } from 'react';
import { Review, ReviewFormData } from '../types';
import { Plus, Trash2, Edit2, Calendar, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn, getCurrentESTDate, parseLocalDate } from '../lib/utils';

export const Journal: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    date: getCurrentESTDate(),
  });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormOpen) {
        setIsFormOpen(false);
        setEditingReview(null);
      }
    };

    if (isFormOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFormOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingReview ? `/api/reviews/${editingReview.id}` : '/api/reviews';
    const method = editingReview ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchReviews();
        setIsFormOpen(false);
        setEditingReview(null);
        setFormData({
          title: '',
          content: '',
          date: getCurrentESTDate(),
        });
      }
    } catch (error) {
      console.error('Failed to save review', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to delete review', error);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      title: review.title,
      content: review.content,
      date: review.date,
    });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={24} className="text-emerald-500" />
          <h2 className="font-serif text-2xl text-white">Trading Thoughts & Reviews</h2>
        </div>
        <button
          onClick={() => {
            setEditingReview(null);
            setFormData({
              title: '',
              content: '',
              date: getCurrentESTDate(),
            });
            setIsFormOpen(true);
          }}
          className="btn-glow flex items-center gap-2"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <p className="font-mono text-sm text-zinc-500 animate-pulse">Loading journal entries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.length === 0 ? (
            <div className="glass-card p-12 text-center text-zinc-500 rounded-2xl">
              No journal entries yet. Start writing your thoughts!
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="glass-card glass-card-hover p-6 space-y-4 group rounded-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                      <Calendar size={12} />
                      {format(parseLocalDate(review.date), 'MMMM dd, yyyy')}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {review.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                      title="Edit Entry"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {review.content}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-zinc-950/90 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="glass-card w-full max-w-2xl p-8 relative rounded-3xl my-auto"
            >
              {/* Decorative Glow - Simplified */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full"></div>
              
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-3xl mb-8 text-white">
                {editingReview ? 'Refine Entry' : 'Capture Entry'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Title</label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Weekly Review, Market Sentiment..."
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-white/10 p-3 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Your Thoughts</label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-white/10 p-3 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-white resize-none leading-relaxed"
                    placeholder="Write your review, market observations, or reminders here..."
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="btn-glow w-full text-lg py-3">
                    {editingReview ? 'Update Entry' : 'Save Entry'}
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
