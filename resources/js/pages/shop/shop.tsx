import { ProductCard } from '@/components/store/product-card';
import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { cn } from '@/lib/utils';
import { type ProductCard as ProductCardType } from '@/types/store';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Category {
    name: string;
    slug: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface ShopProps {
    products: Paginated<ProductCardType>;
    categories: Category[];
    filters: { q: string | null; category: string | null; sort: string };
}

const sorts = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

export default function Shop({ products, categories, filters }: ShopProps) {
    const [search, setSearch] = useState(filters.q ?? '');

    function apply(next: Partial<ShopProps['filters']>) {
        router.get('/shop', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <StoreLayout>
            <Head title="Shop — Sokari Beauty" />
            <div className="section-y">
                <div className="store-container">
                    <SectionHeader eyebrow="Shop All" title="The full collection" />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply({ q: search || null });
                        }}
                        className="mx-auto mt-8 flex max-w-md items-center gap-2"
                    >
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="border-border focus:ring-primary h-11 w-full rounded-full border px-4 text-sm outline-none focus:ring-2"
                        />
                    </form>

                    <div className="mt-10 flex flex-col gap-8 lg:flex-row">
                        <aside className="lg:w-56 lg:shrink-0">
                            <h3 className="text-sm font-semibold tracking-wide uppercase">Categories</h3>
                            <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                                <li>
                                    <button
                                        onClick={() => apply({ category: null })}
                                        className={cn('text-sm transition-colors', !filters.category ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground')}
                                    >
                                        All Products
                                    </button>
                                </li>
                                {categories.map((cat) => (
                                    <li key={cat.slug}>
                                        <button
                                            onClick={() => apply({ category: cat.slug })}
                                            className={cn('text-sm transition-colors', filters.category === cat.slug ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground')}
                                        >
                                            {cat.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <div className="flex-1">
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    {products.from ?? 0}–{products.to ?? 0} of {products.total}
                                </p>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => apply({ sort: e.target.value })}
                                    className="border-border h-10 rounded-full border bg-white px-4 text-sm outline-none"
                                >
                                    {sorts.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {products.data.length === 0 ? (
                                <p className="text-muted-foreground py-16 text-center text-sm">No products match your filters.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
                                    {products.data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}

                            <div className="mt-12 flex flex-wrap justify-center gap-1">
                                {products.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={cn(
                                                'flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition-colors',
                                                link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="text-muted-foreground/40 flex h-9 min-w-9 items-center justify-center px-3 text-sm"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
