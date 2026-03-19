'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  template: {
    id: string;
    name: string;
  };
}

export default function MyReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews/user');
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await axios.delete(`/api/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  if (loading) return <div className="p-6">Loading your reviews...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-gray-500">You haven't written any reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <Link href={`/marketplace/listings/${review.template.id}`} className="text-lg font-semibold text-indigo-600 hover:underline">
                  {review.template.name}
                </Link>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    star <= review.rating ? (
                      <StarSolid key={star} className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <StarOutline key={star} className="w-5 h-5 text-gray-300" />
                    )
                  ))}
                </div>
              </div>
              {review.comment && <p className="mt-2 text-gray-700">{review.comment}</p>}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Link
                    href={`/marketplace/listings/${review.template.id}?edit=${review.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
