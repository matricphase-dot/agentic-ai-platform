'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import axios from '@/lib/axios';

interface ReviewFormProps {
  templateId: string;
  onSuccess: () => void;
  existingReview?: { rating: number; comment: string } | null;
}

export default function ReviewForm({ templateId, onSuccess, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (existingReview) {
        await axios.put(`/api/reviews/${(existingReview as any).id}`, { rating, comment });
      } else {
        await axios.post('/api/reviews', { templateId, rating, comment });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="Share your experience..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  );
}
