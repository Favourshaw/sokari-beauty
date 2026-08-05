import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    className?: string;
    size?: number;
}

export function RatingStars({ rating, className, size = 14 }: RatingStarsProps) {
    return (
        <div className={cn('flex items-center gap-0.5', className)} aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={cn(i < Math.round(rating) ? 'fill-primary text-primary' : 'text-muted-foreground/40')}
                />
            ))}
        </div>
    );
}
