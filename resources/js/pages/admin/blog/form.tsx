import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface PostData {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string | null;
    image: string | null;
    tag: string | null;
    status: string;
}

const input = 'border-border h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary';
const label = 'text-sm font-medium';

export default function BlogForm({ post }: { post?: PostData }) {
    const isEdit = !!post;
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm<{
        title: string; excerpt: string; body: string; tag: string; status: string; image: File | null;
    }>({
        title: post?.title ?? '',
        excerpt: post?.excerpt ?? '',
        body: post?.body ?? '',
        tag: post?.tag ?? '',
        status: post?.status ?? 'draft',
        image: null,
    });

    function selectImage(files: FileList | null) {
        const file = files?.[0] ?? null;
        form.setData('image', file);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            form.post(`/admin/blog/${post!.slug}`, { forceFormData: true, headers: { 'X-HTTP-Method-Override': 'PUT' } });
        } else {
            form.post('/admin/blog', { forceFormData: true });
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Journal', href: '/admin/blog' }, { title: isEdit ? 'Edit' : 'New', href: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit post' : 'New post'} />
            <form onSubmit={submit} className="grid gap-6 p-4 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
                        <div>
                            <label className={label}>Title</label>
                            <input className={input} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                            {form.errors.title && <p className="text-destructive mt-1 text-xs">{form.errors.title}</p>}
                        </div>
                        <div>
                            <label className={label}>Excerpt</label>
                            <input className={input} value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} placeholder="Short summary shown in the journal list" />
                        </div>
                        <div>
                            <label className={label}>Body</label>
                            <textarea
                                className={cn(input, 'h-72 py-2 leading-relaxed')}
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                placeholder="Just write normally — each new line becomes a paragraph. No HTML needed."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
                        <h2 className="text-sm font-medium">Cover image</h2>
                        {(preview || post?.image) && (
                            <div className="bg-muted aspect-[16/9] overflow-hidden rounded-lg">
                                <img src={preview ?? post?.image ?? ''} alt="" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => selectImage(e.target.files)} className="text-sm" />
                        {form.errors.image && <p className="text-destructive text-xs">{form.errors.image}</p>}
                    </div>

                    <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
                        <div>
                            <label className={label}>Tag</label>
                            <input className={input} value={form.data.tag} onChange={(e) => form.setData('tag', e.target.value)} placeholder="e.g. Trends" />
                        </div>
                        <div>
                            <label className={label}>Status</label>
                            <select className={input} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={form.processing} className="bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
                        {form.processing ? 'Saving…' : isEdit ? 'Update post' : 'Create post'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
