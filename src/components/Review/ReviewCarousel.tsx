'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ChevronLeft, ChevronRight, SkipForward, Send } from 'lucide-react';
import { Button } from '@/components/Shared/Button';
import { Avatar } from '@/components/Shared/Avatar';
import { useToast } from '@/components/Shared/Toast';
import { mockSubmitReviews } from '@/lib/mockApi';
import { getUserById } from '@/lib/mockData/users';
import { cn } from '@/lib/utils';

const reviewTags = ['Respectful', 'Punctual', 'Fun', 'Clean', 'Adventurous', 'Flexible'];
const reviewMembers = ['u1', 'u3', 'u4'];

interface Review {
  userId: string;
  rating: number;
  tags: string[];
}

export default function ReviewCarousel() {
  const router = useRouter();
  const toast = useToast();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(
    reviewMembers.map((id) => ({ userId: id, rating: 0, tags: [] })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const current = reviews[currentIdx];
  const user = getUserById(current.userId);
  const progress = ((currentIdx + 1) / reviewMembers.length) * 100;

  const setRating = (rating: number) => {
    setReviews((prev) =>
      prev.map((r, i) => (i === currentIdx ? { ...r, rating } : r)),
    );
  };

  const toggleTag = (tag: string) => {
    setReviews((prev) =>
      prev.map((r, i) =>
        i === currentIdx
          ? { ...r, tags: r.tags.includes(tag) ? r.tags.filter((t) => t !== tag) : [...r.tags, tag] }
          : r,
      ),
    );
  };

  const canSkip = current.rating >= 3.5;
  const isLast = currentIdx === reviewMembers.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await mockSubmitReviews(reviews);
      toast.success('Reviews submitted! You can now apply for new trips.');
      router.push('/');
    } catch {
      toast.error('Failed to submit reviews. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col animate-fade-in">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 py-8">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-charcoal/55 mb-2">
            <span>Rate your crew</span>
            <span>{currentIdx + 1} of {reviewMembers.length}</span>
          </div>
          <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Avatar src={user.avatar} alt={user.name} size="xl" ring />
          <h2 className="font-serif text-xl font-semibold text-charcoal mt-4">{user.name}</h2>
          <p className="text-sm text-charcoal/55 mb-6">How was {user.name.split(' ')[0]} as a travel companion?</p>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-all hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    star <= current.rating ? 'fill-mustard text-mustard' : 'text-charcoal/20',
                  )}
                />
              </button>
            ))}
          </div>

          <div className="w-full">
            <p className="text-xs font-medium text-charcoal/70 mb-3">What stood out?</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {reviewTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                    current.tags.includes(tag)
                      ? 'bg-dusty-teal text-white border-dusty-teal'
                      : 'bg-white text-charcoal/60 border-charcoal/15 hover:border-dusty-teal/40',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-6">
          {currentIdx > 0 ? (
            <Button variant="ghost" onClick={() => setCurrentIdx((i) => i - 1)}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {canSkip && !isLast && (
              <Button variant="outline" size="sm" onClick={handleNext}>
                <SkipForward className="w-3.5 h-3.5" /> Skip
              </Button>
            )}
            {isLast ? (
              <Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
                <Send className="w-4 h-4" /> Submit Reviews
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext} disabled={current.rating === 0}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



