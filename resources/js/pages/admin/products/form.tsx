import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';

interface ExistingImage {
    id: number;
    path: string;
}

interface ProductData {
    id: number;
    slug: string;
    name: string;
    sku: string | null;
    category_id: number | null;
    brand: string | null;
    short_description: string | null;
    description: string | null;
    price: string;
    compare_at_price: string;
    stock_quantity: number;
    track_inventory: boolean;
    status: string;
    is_featured: boolean;
    collection_ids: number[];
    images: ExistingImage[];
}

interface Props {
    product?: ProductData;
    categories: { id: number; name: string }[];
    collections: { id: number; title: string }[];
    statuses: string[];
}

const input = 'border-border h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary';
const label = 'text-sm font-medium';

export default function ProductForm({ product, categories, collections, statuses }: Props) {
    const isEdit = !!product;
    const [deleteImages, setDeleteImages] = useState<number[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    function selectImages(files: FileList | null) {
        const list = Array.from(files ?? []);
        form.setData('images', list);
        // Revoke old object URLs before creating new ones to avoid leaks.
        previews.forEach((url) => URL.revokeObjectURL(url));
        setPreviews(list.map((file) => URL.createObjectURL(file)));
    }

    const form = useForm<{
        name: string; sku: string; category_id: number | ''; brand: string; short_description: string;
        description: string; price: string; compare_at_price: string; stock_quantity: number;
        track_inventory: boolean; status: string; is_featured: boolean; collection_ids: number[];
        images: File[]; delete_images: number[];
    }>({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ?? '',
        brand: product?.brand ?? '',
        short_description: product?.short_description ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        compare_at_price: product?.compare_at_price ?? '',
        stock_quantity: product?.stock_quantity ?? 0,
        track_inventory: product?.track_inventory ?? true,
        status: product?.status ?? 'draft',
        is_featured: product?.is_featured ?? false,
        collection_ids: product?.collection_ids ?? [],
        images: [],
        delete_images: [],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.transform((data) => ({ ...data, delete_images: deleteImages }));
        if (isEdit) {
            form.post(`/admin/products/${product!.slug}`, { forceFormData: true, headers: { 'X-HTTP-Method-Override': 'PUT' } });
        } else {
            form.post('/admin/products', { forceFormData: true });
        }
    }

    function toggleCollection(id: number) {
        form.setData('collection_ids', form.data.collection_ids.includes(id) ? form.data.collection_ids.filter((c) => c !== id) : [...form.data.collection_ids, id]);
    }

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Products', href: '/admin/products' }, { title: isEdit ? 'Edit' : 'New', href: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit product' : 'New product'} />
            <form onSubmit={submit} className="grid gap-6 p-4 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
                        <div>
                            <label className={label}>Name</label>
                            <input className={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            {form.errors.name && <p className="text-destructive mt-1 text-xs">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className={label}>Short description</label>
                            <input className={input} value={form.data.short_description} onChange={(e) => form.setData('short_description', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Description</label>
                            <textarea className={cn(input, 'h-32 py-2')} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        </div>
                    </div>

                    <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
                        <h2 className="text-sm font-medium">Images</h2>
                        {product && product.images.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {product.images.filter((img) => !deleteImages.includes(img.id)).map((img) => (
                                    <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg">
                                        <img src={img.path} alt="" className="h-full w-full object-contain" />
                                        <button type="button" onClick={() => setDeleteImages([...deleteImages, img.id])} className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input type="file" multiple accept="image/*" onChange={(e) => selectImages(e.target.files)} className="text-sm" />
                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {previews.map((src, i) => (
                                    <div key={i} className="border-border h-20 w-20 overflow-hidden rounded-lg border">
                                        <img src={src} alt={`New image ${i + 1}`} className="h-full w-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={label}>Price (£)</label>
                                <input className={input} value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                                {form.errors.price && <p className="text-destructive mt-1 text-xs">{form.errors.price}</p>}
                            </div>
                            <div>
                                <label className={label}>Compare at (£)</label>
                                <input className={input} value={form.data.compare_at_price} onChange={(e) => form.setData('compare_at_price', e.target.value)} />
                            </div>
                            <div>
                                <label className={label}>Stock</label>
                                <input type="number" className={input} value={form.data.stock_quantity} onChange={(e) => form.setData('stock_quantity', Number(e.target.value))} />
                            </div>
                            <div>
                                <label className={label}>SKU</label>
                                <input className={input} value={form.data.sku} onChange={(e) => form.setData('sku', e.target.value)} />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.track_inventory} onChange={(e) => form.setData('track_inventory', e.target.checked)} /> Track inventory
                        </label>
                    </div>

                    <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
                        <div>
                            <label className={label}>Category</label>
                            <select className={input} value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value ? Number(e.target.value) : '')}>
                                <option value="">None</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={label}>Brand</label>
                            <input className={input} value={form.data.brand} onChange={(e) => form.setData('brand', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Status</label>
                            <select className={input} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} /> Featured
                        </label>
                    </div>

                    <div className="border-border flex flex-col gap-2 rounded-xl border p-5">
                        <h2 className="text-sm font-medium">Collections</h2>
                        {collections.map((c) => (
                            <label key={c.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.data.collection_ids.includes(c.id)} onChange={() => toggleCollection(c.id)} /> {c.title}
                            </label>
                        ))}
                    </div>

                    <button type="submit" disabled={form.processing} className="bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
                        {form.processing ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
