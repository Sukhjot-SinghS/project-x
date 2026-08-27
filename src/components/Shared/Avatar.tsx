import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export function Avatar({ src, alt, size = 'md', className, ring = false }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'rounded-full object-cover bg-cream',
        sizes[size],
        ring && 'ring-2 ring-dusty-teal ring-offset-2 ring-offset-cream',
        className,
      )}
    />
  );
}
