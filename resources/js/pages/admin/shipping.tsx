import { ResourcePage } from '@/components/admin/resource-page';

interface ShippingMethod {
    id: number;
    name: string;
    description: string | null;
    price: string;
    price_label: string;
    free_over: string;
    is_active: boolean;
}

export default function Shipping({ methods }: { methods: ShippingMethod[] }) {
    return (
        <ResourcePage<ShippingMethod>
            title="Shipping methods"
            description="Delivery options and rates shown at checkout."
            endpoint="/admin/shipping"
            items={methods}
            defaults={{ name: '', description: '', price: '0.00', free_over: '', is_active: true }}
            columns={[
                { key: 'name', label: 'Name' },
                { key: 'price_label', label: 'Price' },
                { key: 'free_over', label: 'Free over (£)', render: (m) => m.free_over || '—' },
                { key: 'is_active', label: 'Active', render: (m) => (m.is_active ? 'Yes' : 'No') },
            ]}
            fields={[
                { name: 'name', label: 'Name' },
                { name: 'price', label: 'Price (£)' },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'free_over', label: 'Free over (£)', placeholder: 'e.g. 50.00' },
                { name: 'is_active', label: 'Active', type: 'checkbox' },
            ]}
        />
    );
}
