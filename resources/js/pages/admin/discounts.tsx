import { ResourcePage } from '@/components/admin/resource-page';

interface Coupon {
    id: number;
    code: string;
    type: string;
    value: string | number;
    value_label: string;
    min_subtotal: string;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
}

export default function Discounts({ coupons }: { coupons: Coupon[] }) {
    return (
        <ResourcePage<Coupon>
            title="Discounts"
            description="Coupon codes customers can apply at checkout."
            endpoint="/admin/discounts"
            items={coupons}
            defaults={{ code: '', type: 'percentage', value: '', min_subtotal: '', usage_limit: '', is_active: true }}
            columns={[
                { key: 'code', label: 'Code' },
                { key: 'value_label', label: 'Value' },
                { key: 'used_count', label: 'Used', render: (c) => `${c.used_count}${c.usage_limit ? ` / ${c.usage_limit}` : ''}` },
                { key: 'is_active', label: 'Active', render: (c) => (c.is_active ? 'Yes' : 'No') },
            ]}
            fields={[
                { name: 'code', label: 'Code', placeholder: 'WELCOME10' },
                { name: 'type', label: 'Type', type: 'select', options: [{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed (£)' }] },
                { name: 'value', label: 'Value (% or £)' },
                { name: 'min_subtotal', label: 'Min subtotal (£)' },
                { name: 'usage_limit', label: 'Usage limit', type: 'number' },
                { name: 'is_active', label: 'Active', type: 'checkbox' },
            ]}
        />
    );
}
