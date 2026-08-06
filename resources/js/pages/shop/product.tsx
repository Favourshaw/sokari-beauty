import { ProductCard } from '@/components/store/product-card';
import { RatingStars } from '@/components/store/rating-stars';
import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { toParagraphs } from '@/lib/paragraphs';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type ProductCard as ProductCardType } from '@/types/store';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface ProductImage {
    path: string;
    alt: string | null;
}

interface Variant {
    id: number;
    name: string;
    price_formatted: string;
    in_stock: boolean;
}

interface Review {
    author: string;
    rating: number;
    title: string | null;
    body: string;
    date: string | null;
}

interface ProductDetail {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    category: string | null;
    short_description: string | null;
    description: string | null;
    price_formatted: string;
    compare_at_formatted: string | null;
    on_sale: boolean;
    in_stock: boolean;
    stock_quantity: number;
    rating_avg: number;
    rating_count: number;
    images: ProductImage[];
    variants: Variant[];
    tags: string[];
    reviews: Review[];
}

interface ProductProps {
    product: ProductDetail;
    related: ProductCardType[];
}

export default function Product({ product, related }: ProductProps) {
    const { auth } = usePage<SharedData>().props;
    const [activeImage, setActiveImage] = useState(0);
    const [variantId, setVariantId] = useState<number | null>(product.variants[0]?.id ?? null);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const reviewForm = useForm({ rating: 5, title: '', body: '' });

    function addToCart() {
        setAdding(true);
        router.post(
            '/cart/add',
            { product_id: product.id, variant_id: variantId, quantity: qty },
            { preserveScroll: true, onFinish: () => setAdding(false) },
        );
    }

    function toggleWishlist() {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post(`/account/wishlist/${product.id}`, {}, { preserveScroll: true });
    }

    function submitReview(e: React.FormEvent) {
        e.preventDefault();
        reviewForm.post(`/products/${product.slug}/reviews`, { preserveScroll: true, onSuccess: () => reviewForm.reset() });
    }

    return (
        <StoreLayout>
            <Head title={`${product.name} — Sokari Beauty`} />
            <div className="section-y">
                <div className="store-container grid gap-10 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="bg-muted aspect-square overflow-hidden rounded-3xl">
                            {product.images[activeImage] && (
                                <img src={product.images[activeImage].path} alt={product.images[activeImage].alt ?? product.name} className="h-full w-full object-contain p-2" />
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.map((image, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={cn('bg-muted aspect-square overflow-hidden rounded-xl border-2', i === activeImage ? 'border-primary' : 'border-transparent')}
                                    >
                                        <img src={image.path} alt="" className="h-full w-full object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        {product.category && <span className="text-muted-foreground text-xs tracking-[0.2em] uppercase">{product.category}</span>}
                        <h1 className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">{product.name}</h1>

                        {product.rating_count > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                                <RatingStars rating={product.rating_avg} />
                                <span className="text-muted-foreground text-sm">
                                    {product.rating_avg.toFixed(1)} ({product.rating_count} reviews)
                                </span>
                            </div>
                        )}

                        <div className="mt-5 flex items-center gap-3">
                            <span className="text-primary text-2xl font-semibold">{product.price_formatted}</span>
                            {product.compare_at_formatted && <span className="text-muted-foreground text-lg line-through">{product.compare_at_formatted}</span>}
                            {product.on_sale && <span className="bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-xs font-medium">Sale</span>}
                        </div>

                        {product.short_description && <p className="text-muted-foreground mt-5 text-sm leading-relaxed">{product.short_description}</p>}

                        {product.variants.length > 0 && (
                            <div className="mt-6">
                                <span className="text-sm font-medium">Size</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            disabled={!variant.in_stock}
                                            onClick={() => setVariantId(variant.id)}
                                            className={cn(
                                                'rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-40',
                                                variantId === variant.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary',
                                            )}
                                        >
                                            {variant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex items-center gap-4">
                            <div className="border-border flex items-center gap-3 rounded-full border px-3 py-2">
                                <button onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Decrease" className="hover:text-primary">
                                    <Minus size={16} />
                                </button>
                                <span className="w-6 text-center text-sm">{qty}</span>
                                <button onClick={() => setQty((v) => v + 1)} aria-label="Increase" className="hover:text-primary">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={!product.in_stock || adding}
                                className="bg-primary text-primary-foreground inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ShoppingBag size={17} />
                                {product.in_stock ? 'Add to Bag' : 'Sold Out'}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                aria-label="Save to wishlist"
                                className="border-border hover:border-primary hover:text-primary flex h-12 w-12 items-center justify-center rounded-full border transition-colors"
                            >
                                <Heart size={18} />
                            </button>
                        </div>

                        {product.description && (
                            <div className="border-border mt-10 border-t pt-8">
                                <h2 className="text-sm font-semibold tracking-wide uppercase">Details</h2>
                                <div className="prose prose-sm text-muted-foreground mt-3 max-w-none">
                                    {toParagraphs(product.description).map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="store-container mt-24">
                    <SectionHeader title="Reviews" align="left" />
                    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
                        <div className="flex flex-col gap-6">
                            {product.reviews.length === 0 && <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your thoughts.</p>}
                            {product.reviews.map((review, i) => (
                                <div key={i} className="border-border border-b pb-6 last:border-0">
                                    <RatingStars rating={review.rating} />
                                    {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
                                    <p className="text-muted-foreground mt-1 text-sm">{review.body}</p>
                                    <p className="text-muted-foreground mt-2 text-xs">{review.author} · {review.date}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-cream h-fit rounded-2xl p-6">
                            <h3 className="text-sm font-semibold tracking-wide uppercase">Write a review</h3>
                            {auth.user ? (
                                <form onSubmit={submitReview} className="mt-4 flex flex-col gap-3">
                                    <select className="border-border h-10 rounded-lg border bg-white px-3 text-sm" value={reviewForm.data.rating} onChange={(e) => reviewForm.setData('rating', Number(e.target.value))}>
                                        {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
                                    </select>
                                    <input className="border-border h-10 rounded-lg border bg-white px-3 text-sm" placeholder="Title (optional)" value={reviewForm.data.title} onChange={(e) => reviewForm.setData('title', e.target.value)} />
                                    <textarea className="border-border h-24 rounded-lg border bg-white px-3 py-2 text-sm" placeholder="Your review" value={reviewForm.data.body} onChange={(e) => reviewForm.setData('body', e.target.value)} />
                                    <button className="bg-primary text-primary-foreground rounded-full py-2.5 text-sm font-medium" disabled={reviewForm.processing}>Submit review</button>
                                </form>
                            ) : (
                                <p className="text-muted-foreground mt-3 text-sm">
                                    Please <a href="/login" className="text-primary underline">sign in</a> to write a review.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="store-container mt-24">
                        <SectionHeader title="You may also like" />
                        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                            {related.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
