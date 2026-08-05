import { ResourcePage } from '@/components/admin/resource-page';

interface Collection {
    id: number;
    title: string;
    slug: string;
    home_tab: string | null;
    is_featured: boolean;
    is_active: boolean;
    products_count: number;
}

export default function Collections({ collections }: { collections: Collection[] }) {
    return (
        <ResourcePage<Collection>
            title="Collections"
            description="Curated groups of products. Home tabs power the storefront product grid."
            endpoint="/admin/collections"
            items={collections}
            defaults={{ title: '', description: '', home_tab: '', is_featured: false, is_active: true }}
            columns={[
                { key: 'title', label: 'Title' },
                { key: 'home_tab', label: 'Home tab', render: (c) => c.home_tab ?? '—' },
                { key: 'products_count', label: 'Products' },
                { key: 'is_featured', label: 'Featured', render: (c) => (c.is_featured ? 'Yes' : 'No') },
            ]}
            fields={[
                { name: 'title', label: 'Title' },
                { name: 'description', label: 'Description', type: 'textarea' },
                {
                    name: 'home_tab',
                    label: 'Home tab',
                    type: 'select',
                    options: [
                        { value: '', label: 'None' },
                        { value: 'hot', label: "What's Hot" },
                        { value: 'new', label: 'New Arrivals' },
                        { value: 'best', label: 'Best Seller' },
                    ],
                },
                { name: 'is_featured', label: 'Featured', type: 'checkbox' },
                { name: 'is_active', label: 'Active', type: 'checkbox' },
            ]}
        />
    );
}
