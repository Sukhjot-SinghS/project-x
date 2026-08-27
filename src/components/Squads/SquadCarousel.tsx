'use client'
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Member } from '@/types';
import { Avatar } from '@/components/Shared/Avatar';
import { getUserById } from '@/lib/mockData/users';

interface SquadCarouselProps {
  memberIds: string[];
}

export function SquadCarousel({ memberIds }: SquadCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const members: Member[] = memberIds
    .map((id) => getUserById(id))
    .filter((u): u is NonNullable<typeof u> => u !== null)
    .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, cScore: u.cScore }));

  const visibleCount = 4;
  const maxIndex = Math.max(0, members.length - visibleCount);

  return (
    <div className="relative py-1">
      <div className="flex overflow-hidden gap-3">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="flex-shrink-0 w-16 text-center transition-transform duration-300"
            style={{ transform: `translateX(-${currentIndex * 76}px)` }}
          >
            <Avatar src={member.avatar} alt={member.name} size="md" className="mx-auto" ring />
            <p className="text-xs font-medium truncate mt-1 text-charcoal">{member.name}</p>
            <p className="text-[10px] text-mustard font-semibold">{member.cScore}</p>
          </div>
        ))}
      </div>
      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 bg-white shadow-soft rounded-full p-1.5 hover:bg-cream transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-charcoal" />
        </button>
      )}
      {currentIndex < maxIndex && (
        <button
          onClick={() => setCurrentIndex(Math.min(maxIndex, currentIndex + 1))}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 bg-white shadow-soft rounded-full p-1.5 hover:bg-cream transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-charcoal" />
        </button>
      )}
    </div>
  );
}

