import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Orders', href: '/admin/orders' }];

interface OrderRow {
    order_number: string;
    email: string;
    status: string;
    payment_status: string;
    items_count: number;
    total: string;
    placed_at: string | null;
    url: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    orders: { data: OrderRow[]; links: PaginationLink[] };
    filters: { q: string; status: string };
    statuses: string[];
}

const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-200 text-gray-700',
    refunded: 'bg-red-100 text-red-800',
};

export default function OrdersIndex({ orders, filters, statuses }: Props) {
    const [q, setQ] = useState(filters.q);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

                <form onSubmit={(e) => { e.preventDefault(); router.get('/admin/orders', { q, status: filters.status }, { preserveState: true, replace: true }); }} className="flex gap-2">
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order or email…" className="border-border h-10 w-full max-w-xs rounded-lg border px-3 text-sm outline-none" />
                    <select value={filters.status} onChange={(e) => router.get('/admin/orders', { q, status: e.target.value }, { preserveState: true, replace: true })} className="border-border h-10 rounded-lg border px-3 text-sm capitalize">
                        <option value="">All statuses</option>
                        {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                </form>

                <div className="border-border overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-border border-b text-left text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 font-medium">Order</th>
                                <th className="px-4 py-2 font-medium">Customer</th>
                                <th className="px-4 py-2 font-medium">Payment</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                                <th className="px-4 py-2 font-medium">Date</th>
                                <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((order) => (
                                <tr key={order.order_number} className="border-border hover:bg-muted/50 border-b last:border-0">
                                    <td className="px-4 py-3"><Link href={order.url} className="text-primary font-medium">{order.order_number}</Link></td>
                                    <td className="px-4 py-3">{order.email}</td>
                                    <td className="px-4 py-3 capitalize">{order.payment_status}</td>
                                    <td className="px-4 py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs capitalize', statusColor[order.status])}>{order.status}</span></td>
                                    <td className="text-muted-foreground px-4 py-3">{order.placed_at}</td>
                                    <td className="px-4 py-3 text-right font-medium">{order.total}</td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && <tr><td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">No orders found.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-1">
                    {orders.links.map((link, i) =>
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
