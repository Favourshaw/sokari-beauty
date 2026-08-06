import StoreLayout from '@/layouts/store-layout';
import { toParagraphs } from '@/lib/paragraphs';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Post {
    title: string;
    body: string | null;
    image: string | null;
    tag: string | null;
    date: string | null;
}

export default function BlogPost({ post }: { post: Post }) {
    return (
        <StoreLayout>
            <Head title={`${post.title} — Sokari Beauty`} />
            <article className="section-y">
                <div className="store-container max-w-3xl">
                    <Link href="/blog" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm">
                        <ArrowLeft size={15} /> Back to journal
                    </Link>
                    <div className="mt-6 flex items-center gap-2">
                        {post.tag && <span className="bg-accent rounded-full px-2.5 py-0.5 text-[11px] font-medium">{post.tag}</span>}
                        <span className="text-muted-foreground text-xs">{post.date}</span>
                    </div>
                    <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">{post.title}</h1>
                    {post.image && (
                        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
                            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                        </div>
                    )}
                    {post.body && (
                        <div className="prose prose-neutral mt-8 max-w-none">
                            {toParagraphs(post.body).map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    )}
                </div>
            </article>
        </StoreLayout>
    );
}
