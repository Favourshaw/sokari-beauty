import { RatingStars } from '@/components/store/rating-stars';
import { cn } from '@/lib/utils';
import { type ProductCard as ProductCardType } from '@/types/store';
import { Link } from '@inertiajs/react';

interface ProductCardProps {
    product: ProductCardType;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    return (
        <div className={cn('group flex flex-col', className)}>
            <Link href={product.url} className="bg-muted relative block aspect-square overflow-hidden rounded-2xl">
                {product.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className={cn(
                            'h-full w-full object-contain p-2 transition-all duration-700 group-hover:scale-105',
                            product.hover_image && 'group-hover:opacity-0',
                        )}
                    />
                )}
                {product.hover_image && (
                    <img
                        src={product.hover_image}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 h-full w-full scale-105 object-contain p-2 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    />
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.badges.map((badge) => (
                        <span
                            key={badge}
                            className={cn(
                                'rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase',
                                badge === 'Sale' ? 'bg-destructive text-destructive-foreground' : 'bg-foreground text-background',
                            )}
                        >
                            {badge}
                        </span>
                    ))}
                    {!product.in_stock && (
                        <span className="bg-muted-foreground text-background rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase">
                            Sold out
                        </span>
                    )}
                </div>
            </Link>

            <div className="mt-4 flex flex-col gap-1">
                {product.category && <span className="text-muted-foreground text-xs tracking-wide uppercase">{product.category}</span>}
                <Link href={product.url} className="hover:text-primary text-sm font-medium transition-colors">
                    {product.name}
                </Link>
                {product.rating_count > 0 && (
                    <div className="flex items-center gap-1.5">
                        <RatingStars rating={product.rating_avg} size={12} />
                        <span className="text-muted-foreground text-xs">({product.rating_count})</span>
                    </div>
                )}
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-primary text-sm font-semibold">{product.price_formatted}</span>
                    {product.compare_at_formatted && (
                        <span className="text-muted-foreground text-xs line-through">{product.compare_at_formatted}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
