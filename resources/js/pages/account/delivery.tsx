import AccountLayout from '@/layouts/account-layout';
import { Head, useForm } from '@inertiajs/react';

interface Address {
    first_name?: string;
    last_name?: string;
    company?: string;
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
    phone?: string;
}

const input = 'border-border focus:ring-primary h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2';
const label = 'text-sm font-medium';

export default function Delivery({ address }: { address: Address | null }) {
    const form = useForm({
        first_name: address?.first_name ?? '',
        last_name: address?.last_name ?? '',
        company: address?.company ?? '',
        line1: address?.line1 ?? '',
        line2: address?.line2 ?? '',
        city: address?.city ?? '',
        county: address?.county ?? '',
        postcode: address?.postcode ?? '',
        country: address?.country ?? 'GB',
        phone: address?.phone ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put('/account/delivery', { preserveScroll: true });
    }

    const field = (name: keyof typeof form.data, text: string, opts?: { full?: boolean; optional?: boolean }) => (
        <div className={opts?.full ? 'sm:col-span-2' : ''}>
            <label className={label}>
                {text}
                {opts?.optional && <span className="text-muted-foreground"> (optional)</span>}
            </label>
            <input className={input} value={form.data[name]} onChange={(e) => form.setData(name, e.target.value)} />
            {form.errors[name] && <p className="text-destructive mt-1 text-xs">{form.errors[name]}</p>}
        </div>
    );

    return (
        <AccountLayout title="Delivery details">
            <Head title="Delivery details — Sokari Beauty" />
            <p className="text-muted-foreground -mt-4 mb-6 text-sm">Save your delivery address once — we’ll prefill it automatically at checkout.</p>
            <form onSubmit={submit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
                {field('first_name', 'First name')}
                {field('last_name', 'Last name')}
                {field('company', 'Company', { full: true, optional: true })}
                {field('line1', 'Address line 1', { full: true })}
                {field('line2', 'Address line 2', { full: true, optional: true })}
                {field('city', 'City')}
                {field('county', 'County', { optional: true })}
                {field('postcode', 'Postcode')}
                <div>
                    <label className={label}>Country</label>
                    <select className={input} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)}>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="IE">Ireland</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                        <option value="NG">Nigeria</option>
                    </select>
                </div>
                {field('phone', 'Phone', { full: true, optional: true })}
                <button type="submit" disabled={form.processing} className="bg-primary text-primary-foreground mt-2 w-fit rounded-full px-7 py-3 text-sm font-medium disabled:opacity-50 sm:col-span-2">
                    {form.processing ? 'Saving…' : 'Save delivery details'}
                </button>
            </form>
        </AccountLayout>
    );
}
