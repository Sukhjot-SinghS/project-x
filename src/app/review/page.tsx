'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader } from 'lucide-react';
import { useToast } from '@/components/Shared/Toast';
import { mockSubmitReviews } from '@/lib/mockApi';
import { users } from '@/lib/mockData/users';
import { Button } from '@/components/Shared/Button';
import { Avatar } from '@/components/Shared/Avatar';

const reviewTags = [
  'Respectful',
  'Punctual',
  'Fun',
  'Clean',
  'Adventurous',
  'Flexible',
];

interface Review {
  userId: string;
  rating: number;
  tags: string[];
}

export default function ReviewPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(
    users.slice(1, 4).map((u) => ({ userId: u.id, rating: 0, tags: [] }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentReview = reviews[currentIndex];
  const reviewUser = users.find((u) => u.id === currentReview.userId);
  const progress = ((currentIndex + 1) / reviews.length) * 100;

  const updateRating = (rating: number) => {
    setReviews((prev) =>
      prev.map((r, i) => (i === currentIndex ? { ...r, rating } : r))
    );
  };

  const toggleTag = (tag: string) => {
    setReviews((prev) =>
      prev.map((r, i) =>
        i === currentIndex
          ? {
              ...r,
              tags: r.tags.includes(tag)
                ? r.tags.filter((t) => t !== tag)
                : [...r.tags, tag],
            }
          : r
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await mockSubmitReviews(reviews);
      toast.success('Reviews submitted!');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col">
      <div className="p-4 max-w-2xl mx-auto w-full">
        <div className="w-full h-2 bg-charcoal/10 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-terracotta rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mb-8 animate-fade-in">
          <Avatar
            src={reviewUser?.avatar || ''}
            alt={reviewUser?.name || ''}
            size="xl"
            className="mx-auto mb-3"
          />
          <h2 className="text-xl font-bold font-serif text-charcoal">{reviewUser?.name}</h2>
          <p className="text-sm text-charcoal/55">How was your experience?</p>
        </div>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => updateRating(star)}
              className="hover:scale-110 transition-transform"
              aria-label={`${star} stars`}
            >
              <Star
                className={`w-10 h-10 ${star <= currentReview.rating ? 'fill-mustard text-mustard' : 'text-charcoal/20'}`}
              />
            </button>
          ))}
        </div>
        <div className="mb-8">
          <p className="text-sm font-medium text-center mb-3 text-charcoal">Select tags</p>
          <div className="flex flex-wrap justify-center gap-2">
            {reviewTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${currentReview.tags.includes(tag) ? 'bg-terracotta text-white' : 'bg-white border border-charcoal/15 text-charcoal/70'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          {currentIndex < reviews.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Submit Reviews'
              )}
            </Button>
          )}
        </div>
        {currentReview.rating > 0 && currentIndex < reviews.length - 1 && (
          <button
            className="w-full text-center text-sm text-charcoal/40 mt-4 hover:text-charcoal transition-colors"
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
