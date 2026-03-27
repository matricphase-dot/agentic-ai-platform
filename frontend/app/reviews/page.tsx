'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  agents?: { id: string; name: string };  // note: field is 'agents' (plural)
  user?: { email: string };
}

interface Agent {
  id: string;
  name: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, agentsRes] = await Promise.all([
        api.get('/reviews'),
        api.get('/agents')
      ]);
      setReviews(reviewsRes.data);
      setAgents(agentsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError('Please select an agent');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/reviews', {
        agentId: selectedAgentId,
        rating,
        comment
      });
      setSuccess('Review submitted successfully');
      setSelectedAgentId('');
      setRating(5);
      setComment('');
      fetchData(); // refresh list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {/* Submit Review Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Submit a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Agent</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              required
              className="w-full border rounded p-2"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              step="1"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border rounded p-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to leave one.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{review.agents?.name ?? 'Unknown Agent'}</h3>
                    <p className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</p>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-gray-500 text-sm">
                      By {review.user?.email || 'Anonymous'} on {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
