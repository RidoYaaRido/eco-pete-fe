// src/components/review/ReviewList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  helpful: string[];
  flagged: boolean;
  response?: {
    comment: string;
    respondedAt: Date;
  };
  createdAt: Date;
}

interface ReviewListProps {
  locationId: string;
}

export default function ReviewList({ locationId }: ReviewListProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchReviews();
  }, [locationId, sortBy]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/locations/${locationId}/reviews?sort=${sortBy}`);
      setReviews(data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await api.put(`/reviews/${reviewId}/helpful`);
      fetchReviews();
      toast.success('Terima kasih atas feedback Anda!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal memberikan vote');
    }
  };

  const handleFlag = async (reviewId: string) => {
    try {
      await api.put(`/reviews/${reviewId}/flag`);
      toast.success('Ulasan berhasil dilaporkan');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal melaporkan ulasan');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          Ulasan ({reviews.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="recent">Terbaru</option>
          <option value="rating">Rating Tertinggi</option>
          <option value="helpful">Paling Membantu</option>
        </select>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada ulasan untuk lokasi ini</p>
          <p className="text-sm text-gray-500 mt-2">
            Jadilah yang pertama memberikan ulasan!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {review.user.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Mitra Response */}
              {review.response && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Tanggapan dari Mitra
                      </p>
                      <p className="text-sm text-gray-700">{review.response.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.response.respondedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleHelpful(review._id)}
                  disabled={!user || review.helpful.includes(user._id)}
                  className={`flex items-center gap-2 text-sm ${
                    user && review.helpful.includes(user._id)
                      ? 'text-green-600 font-semibold'
                      : 'text-gray-600 hover:text-green-600'
                  } disabled:cursor-not-allowed transition`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Membantu ({review.helpful.length})
                </button>

                {user && user._id !== review.user._id && !review.flagged && (
                  <button
                    onClick={() => handleFlag(review._id)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
                  >
                    <Flag className="w-4 h-4" />
                    Laporkan
                  </button>
                )}

                {review.flagged && (
                  <span className="text-sm text-red-600 font-medium">
                    Dilaporkan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}