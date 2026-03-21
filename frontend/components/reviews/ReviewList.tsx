'use client';

import { Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null; avatar: string | null };
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  count: number;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
  userId?: string;
}

export default function ReviewList({ reviews, averageRating, count, onEdit, onDelete, userId }: ReviewListProps) {
  if (count === 0) {
    return <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
        <div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-5 h-5" />
            ))}
          </div>
          <p className="text-sm text-gray-600">Based on {count} review{count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4 last:border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {review.user.avatar ? (
                  <img src={review.user.avatar} alt={review.user.name || ''} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <span className="font-medium">{review.user.name || 'Anonymous'}</span>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="w-4 h-4" />
              ))}
            </div>
          </div>
          {review.comment && <p className="mt-2 text-sm text-gray-700">{review.comment}</p>}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(review.createdAt))} ago</span>
            {userId === review.user.id && (
              <div className="flex gap-2">
                <button onClick={() => onEdit?.(review)} className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onDelete?.(review.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
