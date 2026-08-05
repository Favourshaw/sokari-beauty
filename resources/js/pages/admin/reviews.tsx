import { RatingStars } from '@/components/store/rating-stars';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reviews', href: '/admin/reviews' }];

interface Review {
    id: number;
    product: string | null;
    author: string | null;
    rating: number;
    title: string | null;
    body: string;
    is_approved: boolean;
    date: string | null;
}

interface Props {
    reviews: { data: Review[] };
    filter: string;
}

export default function AdminReviews({ reviews, filter }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reviews" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
                    <div className="flex gap-1 text-sm">
                        <Link href="/admin/reviews" className={cn('rounded-lg px-3 py-1.5', !filter ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>All</Link>
                        <Link href="/admin/reviews?filter=pending" className={cn('rounded-lg px-3 py-1.5', filter === 'pending' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>Pending</Link>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="border-border rounded-xl border p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <RatingStars rating={review.rating} />
                                        <span className="text-sm font-medium">{review.author}</span>
                                        <span className="text-muted-foreground text-xs">on {review.product}</span>
                                    </div>
                                    {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
                                    <p className="text-muted-foreground mt-1 text-sm">{review.body}</p>
                                    <p className="text-muted-foreground mt-2 text-xs">{review.date}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className={cn('rounded-full px-2 py-0.5 text-xs', review.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>
                                        {review.is_approved ? 'Approved' : 'Pending'}
                                    </span>
                                    <button
                                        onClick={() => router.put(`/admin/reviews/${review.id}`, { is_approved: !review.is_approved }, { preserveScroll: true })}
                                        className="hover:bg-muted rounded-md p-2"
                                        title={review.is_approved ? 'Unapprove' : 'Approve'}
                                    >
                                        <Check size={16} className={review.is_approved ? 'text-green-600' : ''} />
                                    </button>
                                    <button onClick={() => confirm('Delete review?') && router.delete(`/admin/reviews/${review.id}`, { preserveScroll: true })} className="hover:bg-muted text-destructive rounded-md p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {reviews.data.length === 0 && <p className="text-muted-foreground py-10 text-center text-sm">No reviews.</p>}
                </div>
            </div>
        </AppLayout>
    );
}
