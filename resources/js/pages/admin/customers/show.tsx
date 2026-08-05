import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Order {
    order_number: string;
    status: string;
    total: string;
    placed_at: string | null;
    url: string;
}

interface Customer {
    name: string;
    email: string;
    phone: string | null;
    joined: string | null;
    orders: Order[];
}

export default function CustomerShow({ customer }: { customer: Customer }) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Customers', href: '/admin/customers' }, { title: customer.name, href: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer.name} />
            <div className="grid gap-6 p-4 lg:grid-cols-3">
                <div className="border-border h-fit rounded-xl border p-5">
                    <h1 className="text-lg font-semibold">{customer.name}</h1>
                    <p className="text-muted-foreground text-sm">{customer.email}</p>
                    {customer.phone && <p className="text-muted-foreground text-sm">{customer.phone}</p>}
                    <p className="text-muted-foreground mt-2 text-xs">Joined {customer.joined}</p>
                </div>
                <div className="border-border lg:col-span-2 rounded-xl border">
                    <h2 className="p-5 text-sm font-medium">Orders ({customer.orders.length})</h2>
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-border border-y text-left text-xs uppercase">
                            <tr><th className="px-5 py-2 font-medium">Order</th><th className="px-5 py-2 font-medium">Status</th><th className="px-5 py-2 font-medium">Date</th><th className="px-5 py-2 text-right font-medium">Total</th></tr>
                        </thead>
                        <tbody>
                            {customer.orders.map((o) => (
                                <tr key={o.order_number} className="border-border border-b last:border-0">
                                    <td className="px-5 py-3"><Link href={o.url} className="text-primary font-medium">{o.order_number}</Link></td>
                                    <td className="px-5 py-3 capitalize">{o.status}</td>
                                    <td className="text-muted-foreground px-5 py-3">{o.placed_at}</td>
                                    <td className="px-5 py-3 text-right">{o.total}</td>
                                </tr>
                            ))}
                            {customer.orders.length === 0 && <tr><td colSpan={4} className="text-muted-foreground px-5 py-8 text-center">No orders.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
