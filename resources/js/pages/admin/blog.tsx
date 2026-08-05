import { ResourcePage } from '@/components/admin/resource-page';

interface Post {
    id: number;
    title: string;
    excerpt: string | null;
    body: string | null;
    image: string | null;
    tag: string | null;
    status: string;
}

export default function AdminBlog({ posts }: { posts: Post[] }) {
    return (
        <ResourcePage<Post>
            title="Journal"
            description="Blog posts shown on the storefront journal."
            endpoint="/admin/blog"
            items={posts}
            defaults={{ title: '', excerpt: '', body: '', image: '', tag: '', status: 'draft' }}
            columns={[
                { key: 'title', label: 'Title' },
                { key: 'tag', label: 'Tag', render: (p) => p.tag ?? '—' },
                { key: 'status', label: 'Status', render: (p) => (p.status === 'published' ? 'Published' : 'Draft') },
            ]}
            fields={[
                { name: 'title', label: 'Title', full: true },
                { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
                { name: 'body', label: 'Body (HTML)', type: 'textarea' },
                { name: 'image', label: 'Image URL', placeholder: '/images/blog/blog-1.jpg' },
                { name: 'tag', label: 'Tag' },
                { name: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] },
            ]}
        />
    );
}
