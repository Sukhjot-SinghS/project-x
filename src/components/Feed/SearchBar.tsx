'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');

  return (
    <div
      onClick={() => router.push('/search')}
      className="sticky top-14 z-30 bg-cream/90 backdrop-blur-md -mx-4 px-4 py-3 cursor-pointer"
    >
      <div className="flex items-center gap-2 bg-white border border-charcoal/10 rounded-xl px-4 py-3 shadow-soft hover:border-terracotta/30 transition-colors">
        <Search className="w-4 h-4 text-charcoal/40" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search trips, destinations..."
          className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none cursor-pointer"
          onFocus={() => router.push('/search')}
          readOnly
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}



