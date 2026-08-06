import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Journal', href: '/admin/blog' }];

interface Post {
    id: number;
    slug: string;
    title: string;
    tag: string | null;
    status: string;
    image: string | null;
}

export default function BlogIndex({ posts }: { posts: Post[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journal" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
                    <Link href="/admin/blog/create" className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium">
                        <Plus size={16} /> New post
                    </Link>
                </div>

                <div className="border-border overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-border border-b text-left text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 font-medium">Post</th>
                                <th className="px-4 py-2 font-medium">Tag</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="border-border hover:bg-muted/50 border-b last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-muted h-10 w-14 overflow-hidden rounded-md">
                                                {post.image && <img src={post.image} alt="" className="h-full w-full object-cover" />}
                                            </div>
                                            <span className="font-medium">{post.title}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3">{post.tag ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs capitalize', post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/blog/${post.slug}/edit`} className="hover:bg-muted rounded-md p-2"><Pencil size={15} /></Link>
                                            <button onClick={() => confirm('Delete this post?') && router.delete(`/admin/blog/${post.slug}`)} className="hover:bg-muted text-destructive rounded-md p-2">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && <tr><td colSpan={4} className="text-muted-foreground px-4 py-10 text-center">No posts yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
