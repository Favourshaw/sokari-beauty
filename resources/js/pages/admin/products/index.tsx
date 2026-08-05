import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Products', href: '/admin/products' }];

interface ProductRow {
    id: number;
    slug: string;
    name: string;
    sku: string | null;
    price: string;
    stock: number;
    status: string;
    image: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    products: { data: ProductRow[]; links: PaginationLink[] };
    filters: { q: string; status: string };
}

export default function ProductsIndex({ products, filters }: Props) {
    const [q, setQ] = useState(filters.q);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
                    <Link href="/admin/products/create" className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium">
                        <Plus size={16} /> New product
                    </Link>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get('/admin/products', { q, status: filters.status }, { preserveState: true, replace: true });
                    }}
                    className="flex gap-2"
                >
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="border-border h-10 w-full max-w-xs rounded-lg border px-3 text-sm outline-none" />
                    <select
                        value={filters.status}
                        onChange={(e) => router.get('/admin/products', { q, status: e.target.value }, { preserveState: true, replace: true })}
                        className="border-border h-10 rounded-lg border px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </form>

                <div className="border-border overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-border border-b text-left text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 font-medium">Product</th>
                                <th className="px-4 py-2 font-medium">SKU</th>
                                <th className="px-4 py-2 font-medium">Price</th>
                                <th className="px-4 py-2 font-medium">Stock</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr key={product.id} className="border-border hover:bg-muted/50 border-b last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-muted h-10 w-10 overflow-hidden rounded-md">
                                                {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                                            </div>
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3">{product.sku}</td>
                                    <td className="px-4 py-3">{product.price}</td>
                                    <td className="px-4 py-3">{product.stock}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs capitalize', product.status === 'active' ? 'bg-green-100 text-green-800' : product.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800')}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/products/${product.slug}/edit`} className="hover:bg-muted rounded-md p-2"><Pencil size={15} /></Link>
                                            <button
                                                onClick={() => confirm('Delete this product?') && router.delete(`/admin/products/${product.slug}`)}
                                                className="hover:bg-muted text-destructive rounded-md p-2"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr><td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-1">
                    {products.links.map((link, i) =>
                        link.url ? (
                            <Link key={i} href={link.url} className={cn('rounded-md px-3 py-1.5 text-sm', link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ) : (
                            <span key={i} className="text-muted-foreground/40 px-3 py-1.5 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />
                        ),
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
