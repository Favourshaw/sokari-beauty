import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Customers', href: '/admin/customers' }];

interface Customer {
    id: number;
    name: string;
    email: string;
    orders_count: number;
    joined: string | null;
    url: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    customers: { data: Customer[]; links: PaginationLink[] };
    filters: { q: string };
}

export default function CustomersIndex({ customers, filters }: Props) {
    const [q, setQ] = useState(filters.q);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
                <form onSubmit={(e) => { e.preventDefault(); router.get('/admin/customers', { q }, { preserveState: true, replace: true }); }}>
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="border-border h-10 w-full max-w-xs rounded-lg border px-3 text-sm outline-none" />
                </form>
                <div className="border-border overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-border border-b text-left text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 font-medium">Email</th>
                                <th className="px-4 py-2 font-medium">Orders</th>
                                <th className="px-4 py-2 font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((c) => (
                                <tr key={c.id} className="border-border hover:bg-muted/50 border-b last:border-0">
                                    <td className="px-4 py-3"><Link href={c.url} className="text-primary font-medium">{c.name}</Link></td>
                                    <td className="px-4 py-3">{c.email}</td>
                                    <td className="px-4 py-3">{c.orders_count}</td>
                                    <td className="text-muted-foreground px-4 py-3">{c.joined}</td>
                                </tr>
                            ))}
                            {customers.data.length === 0 && <tr><td colSpan={4} className="text-muted-foreground px-4 py-10 text-center">No customers yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap gap-1">
                    {customers.links.map((link, i) =>
                        link.url ? (
                            <Link key={i} href={link.url} className={cn('rounded-md px-3 py-1.5 text-sm', link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ) : (
                            <span key={i} className="text-muted-foreground/40 px-3 py-1.5 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />
                        ),
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
