import { ProductCard } from '@/components/store/product-card';
import AccountLayout from '@/layouts/account-layout';
import { type ProductCard as ProductCardType } from '@/types/store';
import { Head, Link } from '@inertiajs/react';

export default function Wishlist({ products }: { products: ProductCardType[] }) {
    return (
        <AccountLayout title="Wishlist">
            <Head title="Wishlist — Sokari Beauty" />
            {products.length === 0 ? (
                <div className="border-border rounded-2xl border border-dashed p-10 text-center">
                    <p className="text-muted-foreground text-sm">Your wishlist is empty.</p>
                    <Link href="/shop" className="bg-primary text-primary-foreground mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-medium">
                        Browse products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
