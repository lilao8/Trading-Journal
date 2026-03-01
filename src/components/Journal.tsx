import React, { useState, useEffect } from 'react';
import { Review, ReviewFormData } from '../types';
import { Plus, Trash2, Edit2, Calendar, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const Journal: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().slice(0, 10),
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
          date: new Date().toISOString().slice(0, 10),
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
          <BookOpen size={24} />
          <h2 className="font-serif italic text-2xl">Trading Thoughts & Reviews</h2>
        </div>
        <button
          onClick={() => {
            setEditingReview(null);
            setFormData({
              title: '',
              content: '',
              date: new Date().toISOString().slice(0, 10),
            });
            setIsFormOpen(true);
          }}
          className="btn-brutal flex items-center gap-2"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 opacity-40">
          <p className="font-mono text-sm">Loading journal entries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.length === 0 ? (
            <div className="card-brutal p-12 text-center opacity-40 italic">
              No journal entries yet. Start writing your thoughts!
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-brutal p-6 space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wider opacity-50">
                      <Calendar size={12} />
                      {format(new Date(review.date), 'MMMM dd, yyyy')}
                    </div>
                    <h3 className="font-serif italic text-xl font-bold">{review.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Entry"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-[#141414]/80 whitespace-pre-wrap font-sans leading-relaxed">
                  {review.content}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-brutal w-full max-w-2xl p-6 relative"
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif italic text-2xl mb-6">
                {editingReview ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Title</label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Weekly Review, Market Sentiment..."
                      className="w-full border border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border border-black p-2 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Your Thoughts</label>
                  <textarea
                    required
                    rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full border border-black p-2 font-sans focus:outline-none resize-none leading-relaxed"
                    placeholder="Write your review, market observations, or reminders here..."
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="btn-brutal w-full text-lg py-3">
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
