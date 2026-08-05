import { ResourcePage } from '@/components/admin/resource-page';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    products_count: number;
    is_active: boolean;
}

export default function Categories({ categories }: { categories: Category[] }) {
    return (
        <ResourcePage<Category>
            title="Categories"
            description="Organise your catalog into shoppable categories."
            endpoint="/admin/categories"
            items={categories}
            defaults={{ name: '', description: '', is_active: true }}
            columns={[
                { key: 'name', label: 'Name' },
                { key: 'slug', label: 'Slug' },
                { key: 'products_count', label: 'Products' },
                { key: 'is_active', label: 'Active', render: (c) => (c.is_active ? 'Yes' : 'No') },
            ]}
            fields={[
                { name: 'name', label: 'Name' },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'is_active', label: 'Active', type: 'checkbox' },
            ]}
        />
    );
}
