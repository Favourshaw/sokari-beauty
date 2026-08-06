import AccountLayout from '@/layouts/account-layout';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    profile: { name: string; email: string; phone: string | null };
}

const input = 'border-border focus:ring-primary h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2';
const label = 'text-sm font-medium';

export default function Profile({ profile }: Props) {
    const form = useForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch('/account/profile', { preserveScroll: true });
    }

    return (
        <AccountLayout title="Profile">
            <Head title="Profile — Sokari Beauty" />
            <form onSubmit={submit} className="flex max-w-lg flex-col gap-4">
                <div>
                    <label className={label}>Full name</label>
                    <input className={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    {form.errors.name && <p className="text-destructive mt-1 text-xs">{form.errors.name}</p>}
                </div>
                <div>
                    <label className={label}>Email</label>
                    <input type="email" className={input} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    {form.errors.email && <p className="text-destructive mt-1 text-xs">{form.errors.email}</p>}
                </div>
                <div>
                    <label className={label}>Phone</label>
                    <input className={input} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="Optional" />
                    {form.errors.phone && <p className="text-destructive mt-1 text-xs">{form.errors.phone}</p>}
                </div>
                <button type="submit" disabled={form.processing} className="bg-primary text-primary-foreground mt-2 w-fit rounded-full px-7 py-3 text-sm font-medium disabled:opacity-50">
                    {form.processing ? 'Saving…' : 'Save changes'}
                </button>
            </form>
        </AccountLayout>
    );
}
