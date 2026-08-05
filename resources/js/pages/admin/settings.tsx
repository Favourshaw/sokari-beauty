import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Settings', href: '/admin/settings' }];

interface Settings {
    store_name: string | null;
    store_email: string | null;
    store_phone: string | null;
    vat_rate: string | null;
    bank_details: string | null;
    low_stock_threshold: string | null;
    payment_stripe_enabled: string | null;
    payment_cod_enabled: string | null;
    payment_bank_transfer_enabled: string | null;
}

const input = 'border-border h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary';
const label = 'text-sm font-medium';

export default function SettingsPage({ settings }: { settings: Settings }) {
    const form = useForm({
        store_name: settings.store_name ?? '',
        store_email: settings.store_email ?? '',
        store_phone: settings.store_phone ?? '',
        vat_rate: settings.vat_rate ?? '20',
        bank_details: settings.bank_details ?? '',
        low_stock_threshold: settings.low_stock_threshold ?? '5',
        payment_stripe_enabled: settings.payment_stripe_enabled === '1',
        payment_cod_enabled: settings.payment_cod_enabled === '1',
        payment_bank_transfer_enabled: settings.payment_bank_transfer_enabled === '1',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put('/admin/settings', { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <form onSubmit={submit} className="flex max-w-2xl flex-col gap-6 p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Store settings</h1>

                <div className="border-border grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
                    <div><label className={label}>Store name</label><input className={input} value={form.data.store_name} onChange={(e) => form.setData('store_name', e.target.value)} /></div>
                    <div><label className={label}>Store email</label><input className={input} value={form.data.store_email} onChange={(e) => form.setData('store_email', e.target.value)} /></div>
                    <div><label className={label}>Store phone</label><input className={input} value={form.data.store_phone} onChange={(e) => form.setData('store_phone', e.target.value)} /></div>
                    <div><label className={label}>VAT rate (%)</label><input className={input} value={form.data.vat_rate} onChange={(e) => form.setData('vat_rate', e.target.value)} /></div>
                    <div><label className={label}>Low stock threshold</label><input type="number" className={input} value={form.data.low_stock_threshold} onChange={(e) => form.setData('low_stock_threshold', e.target.value)} /></div>
                </div>

                <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
                    <h2 className="text-sm font-medium">Payment methods</h2>
                    {([
                        ['payment_stripe_enabled', 'Card payments (Stripe)'],
                        ['payment_bank_transfer_enabled', 'Bank transfer'],
                        ['payment_cod_enabled', 'Cash on delivery'],
                    ] as const).map(([key, lbl]) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data[key]} onChange={(e) => form.setData(key, e.target.checked)} /> {lbl}
                        </label>
                    ))}
                </div>

                <div className="border-border rounded-xl border p-5">
                    <label className={label}>Bank transfer details</label>
                    <textarea className={cn(input, 'mt-1 h-28 py-2')} value={form.data.bank_details} onChange={(e) => form.setData('bank_details', e.target.value)} />
                </div>

                <button type="submit" disabled={form.processing} className="bg-primary text-primary-foreground w-fit rounded-lg px-6 py-2.5 text-sm font-medium disabled:opacity-50">
                    {form.processing ? 'Saving…' : 'Save settings'}
                </button>
            </form>
        </AppLayout>
    );
}
