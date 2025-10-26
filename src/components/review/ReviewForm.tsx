// src/components/review/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  locationId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ locationId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Pilih rating terlebih dahulu');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Ulasan minimal 10 karakter');
      return;
    }

    try {
      setIsLoading(true);
      await api.post(`/locations/${locationId}/reviews`, {
        rating,
        comment,
      });

      toast.success('Ulasan berhasil ditambahkan!');
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menambahkan ulasan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Tulis Ulasan</h3>

      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-gray-600 font-medium self-center">
              {rating === 1 && 'Sangat Buruk'}
              {rating === 2 && 'Buruk'}
              {rating === 3 && 'Cukup'}
              {rating === 4 && 'Baik'}
              {rating === 5 && 'Sangat Baik'}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ulasan Anda *
        </label>
        <textarea
          rows={4}
          required
          minLength={10}
          maxLength={500}
          placeholder="Bagikan pengalaman Anda..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {comment.length}/500
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || rating === 0}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}