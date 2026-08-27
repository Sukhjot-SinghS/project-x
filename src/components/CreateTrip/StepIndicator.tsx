import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  isComplete
                    ? 'bg-dusty-teal text-white'
                    : isActive
                      ? 'bg-terracotta text-white shadow-warm ring-4 ring-terracotta-light/50'
                      : 'bg-white border border-charcoal/15 text-charcoal/40',
                )}
              >
                {isComplete ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium whitespace-nowrap',
                  isActive ? 'text-terracotta' : isComplete ? 'text-dusty-teal' : 'text-charcoal/40',
                )}
              >
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-0.5 mx-2 rounded-full bg-charcoal/10 relative top-[-10px]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isComplete ? 'bg-dusty-teal' : 'bg-transparent',
                  )}
                  style={{ width: isComplete ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
