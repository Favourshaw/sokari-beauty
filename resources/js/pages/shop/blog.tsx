import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';

interface Post {
    title: string;
    slug: string;
    excerpt: string | null;
    image: string | null;
    tag: string | null;
    date: string | null;
    url: string;
}

export default function Blog({ posts }: { posts: { data: Post[] } }) {
    return (
        <StoreLayout>
            <Head title="Journal — Sokari Beauty" />
            <div className="section-y">
                <div className="store-container">
                    <SectionHeader eyebrow="Journal" title="The Sokari edit" />
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => (
                            <Link key={post.slug} href={post.url} className="group flex flex-col">
                                <div className="bg-muted aspect-[4/3] overflow-hidden rounded-2xl">
                                    {post.image && <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    {post.tag && <span className="bg-accent rounded-full px-2.5 py-0.5 text-[11px] font-medium">{post.tag}</span>}
                                    <span className="text-muted-foreground text-xs">{post.date}</span>
                                </div>
                                <h2 className="group-hover:text-primary mt-2 text-lg font-light transition-colors">{post.title}</h2>
                                {post.excerpt && <p className="text-muted-foreground mt-1 text-sm">{post.excerpt}</p>}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
