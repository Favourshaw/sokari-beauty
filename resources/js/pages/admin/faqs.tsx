import { ResourcePage } from '@/components/admin/resource-page';

interface Faq {
    id: number;
    question: string;
    answer: string;
    position: number;
    is_active: boolean;
}

export default function Faqs({ faqs }: { faqs: Faq[] }) {
    return (
        <ResourcePage<Faq>
            title="FAQs"
            description="Questions shown on the storefront."
            endpoint="/admin/faqs"
            items={faqs}
            defaults={{ question: '', answer: '', position: 0, is_active: true }}
            columns={[
                { key: 'question', label: 'Question' },
                { key: 'position', label: 'Position' },
                { key: 'is_active', label: 'Active', render: (f) => (f.is_active ? 'Yes' : 'No') },
            ]}
            fields={[
                { name: 'question', label: 'Question', full: true },
                { name: 'answer', label: 'Answer', type: 'textarea' },
                { name: 'position', label: 'Position', type: 'number' },
                { name: 'is_active', label: 'Active', type: 'checkbox' },
            ]}
        />
    );
}
